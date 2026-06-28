'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { connectSocket, getSocket } from '@/lib/socket';
import ChatWindow from '@/components/chat/ChatWindow';
import CallOverlay from '@/components/chat/CallOverlay';

interface ConsultationDetails {
  id: string;
  userId: string;
  status: string;
  mode: string;
  perMinuteRate: number;
  expert: { id: string; name: string; avatar: string | null; perMinuteRate: number };
  user: { id: string; name: string; avatar: string | null };
  isAnonymous: boolean;
  userNote?: string;
}

export default function ExpertChatPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params.consultationId as string;

  const [consultation, setConsultation] = useState<ConsultationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inCall, setInCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [expertId, setExpertId] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('expertToken');
    if (!token) {
      router.push('/expert-login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setExpertId(payload.id);
    } catch {
      router.push('/expert-login');
      return;
    }

    connectSocket(token);

    fetch(`${API_URL}/api/consultations/${consultationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setConsultation(data.data);

          // If consultation is ACCEPTED, start it
          if (data.data.status === 'ACCEPTED') {
            fetch(`${API_URL}/api/consultations/start/${consultationId}`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            }).then(() => {
              setConsultation((prev) => prev ? { ...prev, status: 'ACTIVE' } : prev);
            });
          }
        } else {
          setError('Consultation not found');
        }
      })
      .catch(() => setError('Failed to load consultation'))
      .finally(() => setLoading(false));

    const socket = getSocket();
    if (socket) {
      socket.on('consultation:started', () => {
        setConsultation((prev) => prev ? { ...prev, status: 'ACTIVE' } : prev);
      });

      socket.on('consultation:ended', () => {
        setConsultation((prev) => prev ? { ...prev, status: 'COMPLETED' } : prev);
        setInCall(false);
      });
    }

    return () => {
      const s = getSocket();
      if (s) {
        s.off('consultation:started');
        s.off('consultation:ended');
      }
    };
  }, [consultationId, router, API_URL]);

  const handleStartCall = useCallback((video: boolean) => {
    setIsVideoCall(video);
    setInCall(true);
  }, []);

  const handleEndConsultation = useCallback(async () => {
    const token = localStorage.getItem('expertToken');
    try {
      await fetch(`${API_URL}/api/consultations/end/${consultationId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to end consultation:', err);
    }
    router.push('/expert/dashboard');
  }, [API_URL, consultationId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
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
            onClick={() => router.push('/expert/dashboard')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const clientName = consultation.isAnonymous
    ? 'Anonymous User'
    : (consultation.user?.name || 'Client');

  return (
    <>
      <ChatWindow
        consultationId={consultationId}
        socket={getSocket()}
        currentUserId={expertId}
        currentUserType="EXPERT"
        otherPartyName={clientName}
        perMinuteRate={consultation.perMinuteRate}
        isActive={consultation.status === 'ACTIVE'}
        onStartCall={handleStartCall}
        onEndConsultation={handleEndConsultation}
        onBack={() => router.push('/expert/consultations')}
      />

      {inCall && (
        <CallOverlay
          consultationId={consultationId}
          socket={getSocket()}
          isVideo={isVideoCall}
          isCaller={true}
          otherPartyName={clientName}
          perMinuteRate={consultation.perMinuteRate}
          onCallEnd={() => setInCall(false)}
        />
      )}
    </>
  );
}
