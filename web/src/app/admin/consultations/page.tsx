'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Phone, Video, Clock, IndianRupee, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Consultation {
  id: string;
  category: string;
  mode: string;
  status: string;
  duration: number | null;
  totalAmount: number | null;
  platformFee: number | null;
  isAnonymous: boolean;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  user?: { name?: string; phone: string };
  expert?: { name: string; category: string };
  rating?: { rating: number; review?: string };
}

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });

      const res = await fetch(`${API_BASE}/api/admin/consultations?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConsultations(data.data.consultations || []);
        setTotal(data.data.total || 0);
      }
    } catch {
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchConsultations(); }, [fetchConsultations]);

  const totalPages = Math.ceil(total / limit);

  const modeIcons: Record<string, typeof MessageSquare> = {
    CHAT: MessageSquare,
    VOICE: Phone,
    VIDEO: Video,
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/20 text-amber-400',
    ACCEPTED: 'bg-blue-500/20 text-blue-400',
    ACTIVE: 'bg-emerald-500/20 text-emerald-400',
    COMPLETED: 'bg-gray-500/20 text-gray-400',
    REJECTED: 'bg-emergency-500/20 text-emergency-400',
    CANCELLED: 'bg-gray-500/20 text-gray-500',
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">All Consultations</h3>
          <p className="text-sm text-gray-500">Total: {total}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
        </div>
      ) : consultations.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No consultations found</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 font-medium text-gray-500">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Expert</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Mode</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Platform Fee</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => {
                const ModeIcon = modeIcons[c.mode] || MessageSquare;
                return (
                  <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.03]">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-200">{c.isAnonymous ? 'Anonymous' : c.user?.name || c.user?.phone || '-'}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{c.expert?.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded-full">
                        {c.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-gray-400">
                        <ModeIcon className="w-4 h-4" />
                        <span>{c.mode}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[c.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {c.duration ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {c.duration} min
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-200">
                      {c.totalAmount ? (
                        <span className="flex items-center gap-0.5">
                          <IndianRupee className="w-3 h-3" />
                          {c.totalAmount.toFixed(2)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">
                      {c.platformFee ? `₹${c.platformFee.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.06]">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 text-gray-400">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-white/[0.05] disabled:opacity-30 text-gray-400">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
