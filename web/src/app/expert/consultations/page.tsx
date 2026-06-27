'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Phone, Video, Clock, IndianRupee, User, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Consultation {
  id: string;
  category: string;
  mode: string;
  status: string;
  duration: number | null;
  totalAmount: number | null;
  isAnonymous: boolean;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  user?: { name?: string; avatar?: string };
}

export default function ExpertConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('expertToken');
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (filter) params.set('status', filter);

      const res = await fetch(`${API_BASE}/api/experts/consultations?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConsultations(data.data.consultations || []);
        setTotalPages(data.data.pages || 1);
      }
    } catch {
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchConsultations(); }, [fetchConsultations]);

  const modeIcons: Record<string, typeof MessageSquare> = { CHAT: MessageSquare, VOICE: Phone, VIDEO: Video };
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    ACCEPTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    COMPLETED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    CANCELLED: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card">
        <div className="flex gap-2 flex-wrap">
          {[{ val: '', label: 'All' }, { val: 'PENDING', label: 'Pending' }, { val: 'ACTIVE', label: 'Active' }, { val: 'COMPLETED', label: 'Completed' }].map(f => (
            <button
              key={f.val}
              onClick={() => { setFilter(f.val); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f.val ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : consultations.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No consultations found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => {
            const ModeIcon = modeIcons[c.mode] || MessageSquare;
            return (
              <div key={c.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">{c.isAnonymous ? 'Anonymous User' : c.user?.name || 'User'}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><ModeIcon className="w-3.5 h-3.5" /> {c.mode}</span>
                        <span>{c.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[c.status] || 'bg-gray-100 text-gray-600'}`}>
                      {c.status}
                    </span>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      {c.duration && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.duration} min</span>
                      )}
                      {c.totalAmount && (
                        <span className="flex items-center gap-1 text-green-600 font-medium"><IndianRupee className="w-3 h-3" /> {c.totalAmount.toFixed(2)}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-white dark:bg-gray-900 border hover:bg-gray-50 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-white dark:bg-gray-900 border hover:bg-gray-50 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
