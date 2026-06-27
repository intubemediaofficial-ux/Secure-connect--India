'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Star, ChevronLeft, ChevronRight, Loader2, UserCheck, UserX } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Expert {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  qualification: string;
  specialization: string[];
  experience: number;
  perMinuteRate: number;
  rating: number;
  totalConsultations: number;
  isVerified: boolean;
  isActive: boolean;
  isOnline: boolean;
  languages: string[];
  createdAt: string;
  wallet?: { balance: number };
}

export default function AdminExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const limit = 10;

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filter === 'verified') params.set('verified', 'true');
      if (filter === 'pending') params.set('verified', 'false');

      const res = await fetch(`${API_BASE}/api/admin/experts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setExperts(data.data.experts || []);
        setTotal(data.data.total || 0);
      }
    } catch {
      setExperts([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchExperts(); }, [fetchExperts]);

  const handleVerify = async (expertId: string, verify: boolean) => {
    setActionLoading(expertId);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE}/api/admin/experts/${expertId}/verify`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: verify }),
      });
      fetchExperts();
    } catch { /* ignore */ } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (expertId: string, isActive: boolean) => {
    setActionLoading(expertId);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE}/api/admin/experts/${expertId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchExperts();
    } catch { /* ignore */ } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const categoryColors: Record<string, string> = {
    RELATIONSHIP: 'bg-pink-100 text-pink-700',
    MARRIAGE: 'bg-rose-100 text-rose-700',
    FAMILY: 'bg-orange-100 text-orange-700',
    BREAKUP: 'bg-red-100 text-red-700',
    LONELINESS: 'bg-indigo-100 text-indigo-700',
    PERSONAL_LIFE: 'bg-blue-100 text-blue-700',
    EMOTIONAL_STRESS: 'bg-purple-100 text-purple-700',
    PSYCHOLOGY: 'bg-violet-100 text-violet-700',
    MENTAL_WELLNESS: 'bg-teal-100 text-teal-700',
    STRESS: 'bg-amber-100 text-amber-700',
    ANXIETY: 'bg-yellow-100 text-yellow-700',
    DEPRESSION: 'bg-gray-100 text-gray-700',
    WOMEN_HEALTH: 'bg-fuchsia-100 text-fuchsia-700',
    GENERAL_HEALTH: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {(['all', 'verified', 'pending'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All Experts' : f === 'verified' ? 'Verified' : 'Pending Verification'}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">Total: {total} experts</p>
        </div>
      </div>

      {/* Experts Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : experts.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p>No experts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experts.map((expert) => (
            <div key={expert.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-600">{expert.name[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{expert.name}</h3>
                      {expert.isVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {expert.isOnline && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                    </div>
                    <p className="text-sm text-gray-500">{expert.qualification}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[expert.category] || 'bg-gray-100 text-gray-700'}`}>
                  {expert.category.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 text-amber-500" />
                    <span className="text-sm font-semibold">{expert.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <p className="text-sm font-semibold">{expert.totalConsultations}</p>
                  <p className="text-xs text-gray-500">Sessions</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <p className="text-sm font-semibold">₹{expert.perMinuteRate}</p>
                  <p className="text-xs text-gray-500">/min</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {expert.specialization?.slice(0, 3).map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
                    {s}
                  </span>
                ))}
              </div>

              <div className="text-xs text-gray-500 mb-3">
                <p>{expert.email} | {expert.phone}</p>
                <p>{expert.experience} yrs exp | Languages: {expert.languages?.join(', ')}</p>
                <p>Wallet: ₹{expert.wallet?.balance?.toFixed(2) || '0.00'} | Joined: {new Date(expert.createdAt).toLocaleDateString('en-IN')}</p>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                {!expert.isVerified ? (
                  <>
                    <button
                      onClick={() => handleVerify(expert.id, true)}
                      disabled={actionLoading === expert.id}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition"
                    >
                      {actionLoading === expert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(expert.id, false)}
                      disabled={actionLoading === expert.id}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleToggleStatus(expert.id, expert.isActive)}
                    disabled={actionLoading === expert.id}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition ${
                      expert.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {actionLoading === expert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : expert.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    {expert.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </div>
            </div>
          ))}
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
