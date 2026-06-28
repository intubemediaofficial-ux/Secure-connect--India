'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Phone, Video, Clock, Filter, ArrowRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Consultation {
  id: string; category: string; mode: string; status: string;
  duration?: number; amount?: number; createdAt: string;
  user?: { name?: string };
}

export default function ExpertConsultationsPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchConsultations(); }, [filter, page]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('expertToken');
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (filter) params.set('status', filter);
      const res = await fetch(`${API_BASE}/api/experts/consultations?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setConsultations(data.data.consultations || []); setTotal(data.data.total || 0); }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ACTIVE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    CANCELLED: 'bg-emergency-500/20 text-emergency-400 border-emergency-500/30',
  };

  const modeIcons: Record<string, typeof Phone> = { VOICE: Phone, VIDEO: Video, CHAT: MessageSquare };

  const filters = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500" />
        {filters.map(f => (
          <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
              filter === f.value
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-white/[0.03] text-gray-400 border-white/[0.08] hover:bg-white/[0.06]'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Consultations List */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>
      ) : consultations.length === 0 ? (
        <div className="card text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">No consultations found</p>
          <p className="text-gray-600 text-sm mt-1">Consultations will appear here as users book sessions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map(c => {
            const ModeIcon = modeIcons[c.mode] || MessageSquare;
            return (
              <div key={c.id} className="card hover:border-white/[0.15] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <ModeIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">{c.user?.name || 'Anonymous User'}</p>
                    <p className="text-sm text-gray-500">{c.category?.replace('_', ' ')} | {new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {c.duration && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" /> {c.duration} min
                    </div>
                  )}
                  {c.amount && <span className="text-emerald-400 font-medium text-sm">₹{c.amount}</span>}
                  <span className={`badge border ${statusColors[c.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                    {c.status}
                  </span>
                  {(c.status === 'ACTIVE' || c.status === 'ACCEPTED') && (
                    <button
                      onClick={() => router.push(`/expert/chat/${c.id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Chat <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 10 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-gray-400 hover:bg-white/[0.1] disabled:opacity-30 transition">
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 10)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 10)}
            className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-gray-400 hover:bg-white/[0.1] disabled:opacity-30 transition">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
