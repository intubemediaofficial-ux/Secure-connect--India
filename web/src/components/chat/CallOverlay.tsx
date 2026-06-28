'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Clock } from 'lucide-react';
import { Socket } from 'socket.io-client';
import {
  createPeerConnection,
  getLocalStream,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addIceCandidate,
} from '@/lib/webrtc';

interface CallOverlayProps {
  consultationId: string;
  socket: Socket | null;
  isVideo: boolean;
  isCaller: boolean;
  otherPartyName: string;
  perMinuteRate: number;
  onCallEnd: () => void;
}

export default function CallOverlay({
  consultationId,
  socket,
  isVideo,
  isCaller,
  otherPartyName,
  perMinuteRate,
  onCallEnd,
}: CallOverlayProps) {
  const [callState, setCallState] = useState<'connecting' | 'ringing' | 'active' | 'ended'>('connecting');
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  }, []);

  const endCall = useCallback(() => {
    socket?.emit('call:end', consultationId);
    setCallState('ended');
    cleanup();
    setTimeout(onCallEnd, 1000);
  }, [socket, consultationId, cleanup, onCallEnd]);

  useEffect(() => {
    if (!socket || !consultationId) return;

    const startCall = async () => {
      try {
        const localStream = await getLocalStream(isVideo);
        localStreamRef.current = localStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        const pc = createPeerConnection(
          (candidate) => {
            socket.emit('call:ice-candidate', { consultationId, candidate });
          },
          (remoteStream) => {
            remoteStreamRef.current = remoteStream;
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
            setCallState('active');
            timerRef.current = setInterval(() => setTimer((p) => p + 1), 1000);
          },
          (state) => {
            if (state === 'disconnected' || state === 'failed') {
              endCall();
            }
          }
        );

        pcRef.current = pc;

        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });

        if (isCaller) {
          setCallState('ringing');
          const offer = await createOffer(pc);
          socket.emit('call:offer', { consultationId, offer });
        }
      } catch (err) {
        console.error('[Call] Error starting call:', err);
        setCallState('ended');
        setTimeout(onCallEnd, 1500);
      }
    };

    startCall();

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      if (!pcRef.current) return;
      await setRemoteDescription(pcRef.current, data.offer);
      const answer = await createAnswer(pcRef.current);
      socket.emit('call:answer', { consultationId, answer });
    };

    const handleAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
      if (!pcRef.current) return;
      await setRemoteDescription(pcRef.current, data.answer);
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
      if (!pcRef.current) return;
      try {
        await addIceCandidate(pcRef.current, data.candidate);
      } catch (err) {
        console.error('[Call] ICE candidate error:', err);
      }
    };

    const handleCallEnded = () => {
      setCallState('ended');
      cleanup();
      setTimeout(onCallEnd, 1000);
    };

    socket.on('call:offer', handleOffer);
    socket.on('call:answer', handleAnswer);
    socket.on('call:ice-candidate', handleIceCandidate);
    socket.on('call:ended', handleCallEnded);

    return () => {
      socket.off('call:offer', handleOffer);
      socket.off('call:answer', handleAnswer);
      socket.off('call:ice-candidate', handleIceCandidate);
      socket.off('call:ended', handleCallEnded);
      cleanup();
    };
  }, [socket, consultationId, isVideo, isCaller, cleanup, endCall, onCallEnd]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/95 backdrop-blur-xl flex flex-col items-center justify-center">
      {/* Remote video (fullscreen) */}
      {isVideo && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Overlay content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1">
        {/* Avatar / Status */}
        {(!isVideo || callState !== 'active') && (
          <>
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mb-6 shadow-2xl shadow-primary-500/30">
              {otherPartyName[0]}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{otherPartyName}</h2>
            <p className="text-gray-400 mb-6">
              {callState === 'connecting' && 'Connecting...'}
              {callState === 'ringing' && 'Ringing...'}
              {callState === 'active' && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatTime(timer)}
                  <span className="text-emerald-400 text-sm">
                    ₹{(Math.ceil(timer / 60) * perMinuteRate).toFixed(0)}
                  </span>
                </span>
              )}
              {callState === 'ended' && 'Call Ended'}
            </p>
          </>
        )}

        {/* Active call timer overlay for video */}
        {isVideo && callState === 'active' && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-gray-900/80 backdrop-blur text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatTime(timer)}
            <span className="text-emerald-400">₹{(Math.ceil(timer / 60) * perMinuteRate).toFixed(0)}</span>
          </div>
        )}

        {/* Ringing animation */}
        {(callState === 'connecting' || callState === 'ringing') && (
          <div className="flex gap-3 mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Local video (PIP) */}
      {isVideo && callState === 'active' && (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-28 right-4 w-32 h-44 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
        />
      )}

      {/* Controls */}
      <div className="relative z-10 flex items-center gap-4 pb-12">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition ${
            isMuted
              ? 'bg-red-500/20 text-red-400'
              : 'bg-white/[0.08] text-white hover:bg-white/[0.12]'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {isVideo && (
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition ${
              isVideoOff
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white/[0.08] text-white hover:bg-white/[0.12]'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition shadow-lg shadow-red-600/30"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
