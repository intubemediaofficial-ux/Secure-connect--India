'use client';

import { Phone, PhoneOff, User, Video } from 'lucide-react';

interface IncomingCallModalProps {
  callerName: string;
  isVideo: boolean;
  category: string;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({
  callerName,
  isVideo,
  category,
  onAccept,
  onReject,
}: IncomingCallModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-950/90 backdrop-blur-xl flex items-center justify-center">
      <div className="bg-gray-900/80 backdrop-blur-2xl rounded-3xl p-8 border border-white/[0.08] text-center max-w-sm w-full mx-4 shadow-2xl">
        {/* Pulsing avatar */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-500/30">
            {callerName[0]}
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{callerName}</h3>
        <p className="text-gray-400 text-sm mb-2">Incoming {isVideo ? 'Video' : 'Voice'} Call</p>
        <span className="inline-block px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-medium mb-8">
          {category}
        </span>

        <div className="flex items-center justify-center gap-8">
          <button
            onClick={onReject}
            className="p-5 rounded-full bg-red-600 text-white hover:bg-red-700 transition shadow-lg shadow-red-600/30"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
          <button
            onClick={onAccept}
            className="p-5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/30 animate-pulse"
          >
            {isVideo ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-6 text-xs text-gray-500">
          <span>Decline</span>
          <span>Accept</span>
        </div>
      </div>
    </div>
  );
}
