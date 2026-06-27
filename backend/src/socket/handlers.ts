import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthSocket extends Socket {
  userId?: string;
  userType?: string;
}

export function setupSocketHandlers(io: Server) {
  // Authentication middleware
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secureconnect-secret-key') as any;
      socket.userId = decoded.id;
      socket.userType = decoded.type;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!;
    const userType = socket.userType!;

    console.log(`[Socket] ${userType}:${userId} connected`);

    // Join personal room
    socket.join(`${userType}:${userId}`);

    // Join consultation room
    socket.on('consultation:join', (consultationId: string) => {
      socket.join(`consultation:${consultationId}`);
      socket.to(`consultation:${consultationId}`).emit('consultation:user-joined', { userId, userType });
    });

    socket.on('consultation:leave', (consultationId: string) => {
      socket.leave(`consultation:${consultationId}`);
      socket.to(`consultation:${consultationId}`).emit('consultation:user-left', { userId, userType });
    });

    // Chat messages
    socket.on('chat:message', (data: { consultationId: string; content: string; messageType?: string }) => {
      io.to(`consultation:${data.consultationId}`).emit('chat:message', {
        senderId: userId,
        senderType: userType.toUpperCase(),
        content: data.content,
        messageType: data.messageType || 'TEXT',
        createdAt: new Date().toISOString(),
      });
    });

    // Typing indicators
    socket.on('chat:typing', (consultationId: string) => {
      socket.to(`consultation:${consultationId}`).emit('chat:typing', { userId, userType });
    });

    socket.on('chat:stop-typing', (consultationId: string) => {
      socket.to(`consultation:${consultationId}`).emit('chat:stop-typing', { userId, userType });
    });

    // Voice call signaling (WebRTC)
    socket.on('call:offer', (data: { consultationId: string; offer: any }) => {
      socket.to(`consultation:${data.consultationId}`).emit('call:offer', {
        offer: data.offer,
        from: userId,
      });
    });

    socket.on('call:answer', (data: { consultationId: string; answer: any }) => {
      socket.to(`consultation:${data.consultationId}`).emit('call:answer', {
        answer: data.answer,
        from: userId,
      });
    });

    socket.on('call:ice-candidate', (data: { consultationId: string; candidate: any }) => {
      socket.to(`consultation:${data.consultationId}`).emit('call:ice-candidate', {
        candidate: data.candidate,
        from: userId,
      });
    });

    socket.on('call:end', (consultationId: string) => {
      io.to(`consultation:${consultationId}`).emit('call:ended', { by: userId });
    });

    // SOS real-time tracking
    socket.on('sos:track', (alertId: string) => {
      socket.join(`sos:${alertId}`);
    });

    socket.on('sos:location-update', (data: { alertId: string; latitude: number; longitude: number }) => {
      io.to(`sos:${data.alertId}`).emit('sos:location', data);
    });

    // Expert status
    socket.on('expert:status', (status: 'online' | 'offline') => {
      io.emit(`expert:${status}`, { expertId: userId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] ${userType}:${userId} disconnected`);

      // If expert disconnects, mark offline
      if (userType === 'expert') {
        io.emit('expert:offline', { expertId: userId });
      }
    });
  });
}
