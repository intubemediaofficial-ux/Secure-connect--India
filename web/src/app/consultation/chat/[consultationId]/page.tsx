'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import ChatWindow from '@/components/chat/ChatWindow';
import CallOverlay from '@/components/chat/CallOverlay';

interface ConsultationDetails {
  id: string;
  expertId: string;
  status: string;
  mode: string;
  perMinuteRate: number;
  expert: { id: string; name: string; avatar: string | null; perMinuteRate: number };
  user: { id: string; name: string; avatar: string | null };
}

export default function ClientChatPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params.consultationId as string;

  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inCall, setInCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [userId, setUserId] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Decode user ID from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    } catch {
      router.push('/login');
      return;
    }

    // Connect socket
    connectSocket(token);

    // Fetch consultation details
    fetch(`${API_URL}/api/consultations/${consultationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setConsultation(data.data);
        } else {
          setError('Consultation not found');
        }
      })
      .catch(() => setError('Failed to load consultation'))
      .finally(() => setLoading(false));

    // Listen for consultation events
    const socket = getSocket();
    if (socket) {
      socket.on('consultation:started', (data: ConsultationDetails) => {
        setConsultation((prev) => prev ? { ...prev, status: 'ACTIVE' } : prev);
      });

      socket.on('consultation:ended', () => {
        setConsultation((prev) => prev ? { ...prev, status: 'COMPLETED' } : prev);
        setInCall(false);
      });

      socket.on('call:offer', () => {
        // Incoming call from expert
        setInCall(true);
      });
    }

    return () => {
      const s = getSocket();
      if (s) {
        s.off('consultation:started');
        s.off('consultation:ended');
        s.off('call:offer');
      }
    };
  }, [consultationId, router, API_URL]);

  const handleStartCall = useCallback((video: boolean) => {
    setIsVideoCall(video);
    setInCall(true);
  }, []);

  const handleEndConsultation = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/consultations/end/${consultationId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to end consultation:', err);
    }
    router.push('/dashboard');
  }, [API_URL, consultationId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-gray-400">Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Consultation not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ChatWindow
        consultationId={consultationId}
        socket={getSocket()}
        currentUserId={userId}
        currentUserType="USER"
        otherPartyName={consultation.expert.name}
        perMinuteRate={consultation.perMinuteRate}
        isActive={consultation.status === 'ACTIVE'}
        onStartCall={handleStartCall}
        onEndConsultation={handleEndConsultation}
        onBack={() => router.push('/dashboard')}
      />

      {inCall && (
        <CallOverlay
          consultationId={consultationId}
          socket={getSocket()}
          isVideo={isVideoCall}
          isCaller={true}
          otherPartyName={consultation.expert.name}
          perMinuteRate={consultation.perMinuteRate}
          onCallEnd={() => setInCall(false)}
        />
      )}
    </>
  );
}
