'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, Phone, Video, X, ArrowLeft, MoreVertical, Clock } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface Message {
  id?: string;
  senderId: string;
  senderType: 'USER' | 'EXPERT';
  content: string;
  messageType: string;
  createdAt: string;
  isRead?: boolean;
}

interface ChatWindowProps {
  consultationId: string;
  socket: Socket | null;
  currentUserId: string;
  currentUserType: 'USER' | 'EXPERT';
  otherPartyName: string;
  otherPartyAvatar?: string;
  perMinuteRate: number;
  isActive: boolean;
  onStartCall: (video: boolean) => void;
  onEndConsultation: () => void;
  onBack: () => void;
}

export default function ChatWindow({
  consultationId,
  socket,
  currentUserId,
  currentUserType,
  otherPartyName,
  perMinuteRate,
  isActive,
  onStartCall,
  onEndConsultation,
  onBack,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!socket || !consultationId) return;

    socket.emit('consultation:join', consultationId);

    // Load existing messages
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/chat/messages/${consultationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMessages(data.data.messages);
      })
      .catch(console.error);

    const handleMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      setOtherTyping(false);
    };

    const handleTyping = () => setOtherTyping(true);
    const handleStopTyping = () => setOtherTyping(false);

    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);
    socket.on('chat:stop-typing', handleStopTyping);

    return () => {
      socket.emit('consultation:leave', consultationId);
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
      socket.off('chat:stop-typing', handleStopTyping);
    };
  }, [socket, consultationId]);

  // Start billing timer when consultation is active
  useEffect(() => {
    if (isActive && !timerRunning) {
      setTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timerRunning]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  const sendMessage = () => {
    if (!inputText.trim() || !socket) return;

    socket.emit('chat:message', {
      consultationId,
      content: inputText.trim(),
      messageType: 'TEXT',
    });

    socket.emit('chat:stop-typing', consultationId);
    setInputText('');
    setIsTyping(false);
  };

  const handleInputChange = (value: string) => {
    setInputText(value);
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('chat:typing', consultationId);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('chat:stop-typing', consultationId);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentCost = Math.ceil(timer / 60) * perMinuteRate;

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {otherPartyName[0]}
          </div>
          <div>
            <h3 className="font-semibold text-white">{otherPartyName}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {isActive && (
                <>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(timer)}
                  </span>
                  <span>|</span>
                  <span className="text-emerald-400">₹{currentCost.toFixed(0)} ({perMinuteRate}/min)</span>
                </>
              )}
              {!isActive && <span className="text-amber-400">Connecting...</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartCall(false)}
            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition"
            title="Voice Call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => onStartCall(true)}
            className="p-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition"
            title="Video Call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={onEndConsultation}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
            title="End Consultation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* System message */}
        <div className="flex justify-center">
          <span className="px-4 py-1.5 rounded-full bg-gray-800/60 text-gray-400 text-xs">
            Consultation started. All conversations are confidential.
          </span>
        </div>

        {messages.map((msg, idx) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isMine
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-md'
                    : 'bg-gray-800/80 text-gray-200 rounded-bl-md border border-white/[0.06]'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-200' : 'text-gray-500'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-gray-800/80 border border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-gray-900/90 backdrop-blur-xl border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-gray-800/60 rounded-2xl border border-white/[0.08] px-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="p-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white disabled:opacity-40 hover:from-primary-500 hover:to-primary-400 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
