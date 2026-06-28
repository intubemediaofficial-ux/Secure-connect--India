'use client';

import { useState } from 'react';
import { MessageCircle, Phone, Video, X, Shield, Clock, IndianRupee, AlertCircle } from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  qualification: string;
  category: string;
  perMinuteRate: number;
  rating: number;
  isOnline: boolean;
}

interface ConsultationRequestModalProps {
  expert: Expert;
  walletBalance: number;
  onSubmit: (data: { mode: string; isAnonymous: boolean; userNote: string }) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function ConsultationRequestModal({
  expert,
  walletBalance,
  onSubmit,
  onClose,
  isLoading,
}: ConsultationRequestModalProps) {
  const [mode, setMode] = useState('CHAT');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userNote, setUserNote] = useState('');

  const minBalance = expert.perMinuteRate * 5;
  const hasEnoughBalance = walletBalance >= minBalance;
  const estimatedMinutes = Math.floor(walletBalance / expert.perMinuteRate);

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-2xl rounded-2xl border border-white/[0.08] w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white">Start Consultation</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.06] text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Expert info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
              {expert.name[0]}
            </div>
            <div>
              <h4 className="font-medium text-white">{expert.name}</h4>
              <p className="text-sm text-gray-400">{expert.qualification}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-emerald-400 font-bold">₹{expert.perMinuteRate}/min</p>
            </div>
          </div>

          {/* Mode selection */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Consultation Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CHAT', icon: MessageCircle, label: 'Chat' },
                { id: 'VOICE_CALL', icon: Phone, label: 'Voice Call' },
                { id: 'VIDEO_CALL', icon: Video, label: 'Video Call' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition ${
                    mode === m.id
                      ? 'bg-primary-500/20 border-primary-500/40 text-primary-400'
                      : 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:border-white/[0.12]'
                  }`}
                >
                  <m.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-gray-300">Consult Anonymously</span>
            </div>
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-11 h-6 rounded-full transition ${
                isAnonymous ? 'bg-emerald-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isAnonymous ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Brief note (optional)
            </label>
            <textarea
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="Briefly describe what you'd like to discuss..."
              className="w-full bg-gray-800/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 resize-none"
              rows={3}
            />
          </div>

          {/* Wallet balance */}
          <div className={`flex items-center gap-3 p-3 rounded-xl ${
            hasEnoughBalance ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <IndianRupee className={`w-5 h-5 ${hasEnoughBalance ? 'text-emerald-400' : 'text-red-400'}`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${hasEnoughBalance ? 'text-emerald-300' : 'text-red-300'}`}>
                Wallet: ₹{walletBalance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">
                {hasEnoughBalance
                  ? `~${estimatedMinutes} min available at ₹${expert.perMinuteRate}/min`
                  : `Need ₹${minBalance.toFixed(0)} minimum (5 min × ₹${expert.perMinuteRate})`}
              </p>
            </div>
          </div>

          {!hasEnoughBalance && (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Please recharge your wallet to start consultation</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.06] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-400 bg-white/[0.06] hover:bg-white/[0.08] transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ mode, isAnonymous, userNote })}
            disabled={!hasEnoughBalance || isLoading}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Start Consultation'}
          </button>
        </div>
      </div>
    </div>
  );
}
