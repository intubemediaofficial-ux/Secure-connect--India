'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Star, Clock, MessageCircle, Phone, Video, Globe, Loader2 } from 'lucide-react';
import { connectSocket, getSocket } from '@/lib/socket';
import ConsultationRequestModal from '@/components/chat/ConsultationRequestModal';

interface Expert {
  id: string;
  name: string;
  avatar: string | null;
  qualification: string;
  specialization: string[];
  experience: number;
  rating: number;
  totalRatings: number;
  totalConsultations: number;
  perMinuteRate: number;
  isOnline: boolean;
  languages: string[];
  category: string;
}

export default function ConsultationPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [requestLoading, setRequestLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'RELATIONSHIP', label: 'Relationship' },
    { id: 'MARRIAGE', label: 'Marriage' },
    { id: 'FAMILY', label: 'Family' },
    { id: 'BREAKUP', label: 'Breakup' },
    { id: 'PSYCHOLOGY', label: 'Psychology' },
    { id: 'MENTAL_WELLNESS', label: 'Mental Health' },
    { id: 'WOMENS_HEALTH', label: "Women's Health" },
    { id: 'STRESS', label: 'Stress' },
  ];

  useEffect(() => {
    fetchExperts();
    fetchWalletBalance();

    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);

      const socket = getSocket();
      if (socket) {
        socket.on('consultation:accepted', (data: { id: string }) => {
          router.push(`/consultation/chat/${data.id}`);
        });

        socket.on('consultation:rejected', () => {
          alert('Expert has declined the consultation request. Please try another expert.');
          setRequestLoading(false);
        });
      }
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('consultation:accepted');
        socket.off('consultation:rejected');
      }
    };
  }, [router]);

  const fetchExperts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/consultations/experts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setExperts(data.data.experts || []);
    } catch {
      // fallback to demo data if API fails
      setExperts([
        {
          id: '1', name: 'Dr. Anjali Sharma', avatar: null,
          qualification: 'M.A. Psychology, PhD', specialization: ['Relationship', 'Marriage'],
          experience: 8, rating: 4.8, totalRatings: 245, totalConsultations: 1200,
          perMinuteRate: 12, isOnline: true, languages: ['Hindi', 'English'],
          category: 'RELATIONSHIP',
        },
        {
          id: '2', name: 'Dr. Priya Verma', avatar: null,
          qualification: 'MBBS, MS (OB-GYN)', specialization: ["Women's Health", 'PCOS'],
          experience: 12, rating: 4.9, totalRatings: 380, totalConsultations: 2100,
          perMinuteRate: 18, isOnline: true, languages: ['Hindi', 'English', 'Punjabi'],
          category: 'WOMENS_HEALTH',
        },
        {
          id: '3', name: 'Counselor Rahul Mehta', avatar: null,
          qualification: 'M.Sc. Clinical Psychology', specialization: ['Stress', 'Anxiety', 'Depression'],
          experience: 5, rating: 4.7, totalRatings: 156, totalConsultations: 800,
          perMinuteRate: 10, isOnline: false, languages: ['Hindi', 'English'],
          category: 'MENTAL_WELLNESS',
        },
        {
          id: '4', name: 'Dr. Neha Gupta', avatar: null,
          qualification: 'M.Phil. Psychology', specialization: ['Family', 'Marriage Counseling'],
          experience: 10, rating: 4.6, totalRatings: 298, totalConsultations: 1500,
          perMinuteRate: 15, isOnline: true, languages: ['Hindi', 'English', 'Marathi'],
          category: 'FAMILY',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setWalletBalance(data.data.balance || 0);
    } catch { /* ignore */ }
  };

  const handleConnect = (expert: Expert) => {
    setSelectedExpert(expert);
  };

  const handleSubmitRequest = async (data: { mode: string; isAnonymous: boolean; userNote: string }) => {
    if (!selectedExpert) return;
    setRequestLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/consultations/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expertId: selectedExpert.id,
          category: selectedExpert.category,
          mode: data.mode,
          isAnonymous: data.isAnonymous,
          userNote: data.userNote,
        }),
      });

      const result = await res.json();
      if (result.success) {
        // Wait for expert to accept - socket will handle redirect
        setSelectedExpert(null);
      } else {
        alert(result.error || 'Failed to send request');
        setRequestLoading(false);
      }
    } catch {
      alert('Failed to send request. Please try again.');
      setRequestLoading(false);
    }
  };

  const filteredExperts = experts.filter((e) => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.specialization.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen page-bg p-4 md:p-6 lg:ml-72">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Expert Consultation</h1>
          <p className="text-gray-400">Connect with verified experts for confidential support</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experts by name or specialization..."
            className="w-full bg-gray-900/60 border border-white/[0.08] rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-gray-900/60 text-gray-400 border border-white/[0.08] hover:border-primary-500/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Consultation Mode */}
        <div className="flex gap-3">
          {[
            { id: 'CHAT', icon: MessageCircle, label: 'Chat' },
            { id: 'VOICE_CALL', icon: Phone, label: 'Voice Call' },
            { id: 'VIDEO_CALL', icon: Video, label: 'Video Call' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(selectedMode === mode.id ? null : mode.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedMode === mode.id
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'bg-gray-900/60 border border-white/[0.08] text-gray-400 hover:border-white/[0.12]'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        )}

        {/* Waiting for expert */}
        {requestLoading && (
          <div className="card text-center py-8">
            <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">Waiting for Expert</h3>
            <p className="text-gray-400 text-sm">Your consultation request has been sent. Please wait...</p>
          </div>
        )}

        {/* Expert List */}
        {!loading && !requestLoading && (
          <div className="space-y-4">
            {filteredExperts.map((expert) => (
              <div key={expert.id} className="card hover:border-white/[0.12] transition">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-white/[0.08]">
                      <span className="text-2xl font-bold text-primary-400">{expert.name[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{expert.name}</h3>
                        {expert.isOnline && (
                          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Online
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{expert.qualification}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {expert.specialization.map((s) => (
                          <span key={s} className="text-xs bg-white/[0.06] px-2 py-0.5 rounded-full text-gray-400 border border-white/[0.06]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:flex-col md:items-end">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-300">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {expert.rating} ({expert.totalRatings})
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" /> {expert.experience} yrs
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Globe className="w-4 h-4" /> {expert.languages.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-emerald-400">₹{expert.perMinuteRate}/min</span>
                      <button
                        onClick={() => handleConnect(expert)}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition ${
                          expert.isOnline
                            ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/20'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/[0.06]'
                        }`}
                        disabled={!expert.isOnline}
                      >
                        {expert.isOnline ? 'Connect' : 'Offline'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredExperts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No experts found matching your criteria</p>
            <p className="text-sm mt-2">Try changing filters or search query</p>
          </div>
        )}
      </div>

      {/* Consultation Request Modal */}
      {selectedExpert && (
        <ConsultationRequestModal
          expert={selectedExpert}
          walletBalance={walletBalance}
          onSubmit={handleSubmitRequest}
          onClose={() => setSelectedExpert(null)}
          isLoading={requestLoading}
        />
      )}
    </div>
  );
}
