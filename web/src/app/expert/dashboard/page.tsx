'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, IndianRupee, Clock, Users, TrendingUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface DashboardData {
  expert: {
    name: string;
    category: string;
    rating: number;
    totalConsultations: number;
    isVerified: boolean;
    isOnline: boolean;
  };
  stats: {
    todayConsultations: number;
    pendingRequests: number;
    balance: number;
    totalEarnings: number;
  };
}

interface PendingRequest {
  id: string;
  category: string;
  mode: string;
  isAnonymous: boolean;
  createdAt: string;
  user?: { name?: string; avatar?: string };
}

export default function ExpertDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
    fetchPending();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/consultations?status=PENDING`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) setPending(result.data.consultations || []);
    } catch { /* ignore */ }
  };

  const handleAction = async (consultationId: string, action: 'accept' | 'reject') => {
    setActionLoading(consultationId);
    try {
      const token = localStorage.getItem('expertToken');
      await fetch(`${API_BASE}/api/consultations/${consultationId}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPending();
      fetchDashboard();
    } catch { /* ignore */ } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const stats = [
    { label: "Today's Sessions", value: data?.stats.todayConsultations || 0, icon: MessageSquare, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Pending Requests', value: data?.stats.pendingRequests || 0, icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Wallet Balance', value: `₹${(data?.stats.balance || 0).toFixed(2)}`, icon: IndianRupee, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: 'Total Earnings', value: `₹${(data?.stats.totalEarnings || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Welcome, {data?.expert.name || 'Expert'}!</h2>
            <p className="text-emerald-100 mt-1">{data?.expert.category?.replace('_', ' ')} | Rating: {data?.expert.rating?.toFixed(1) || '0.0'} ★</p>
          </div>
          <div className="flex items-center gap-2">
            {data?.expert.isVerified ? (
              <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                <CheckCircle className="w-4 h-4" /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-amber-500/30 px-3 py-1 rounded-full text-sm">
                <Clock className="w-4 h-4" /> Pending Verification
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Requests */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Pending Consultation Requests
        </h3>
        {pending.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No pending requests</p>
            <p className="text-xs mt-1">New requests will appear here when users book you</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">{req.isAnonymous ? 'Anonymous User' : req.user?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">
                      {req.category.replace('_', ' ')} | {req.mode} | {new Date(req.createdAt).toLocaleTimeString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(req.id, 'accept')}
                    disabled={actionLoading === req.id}
                    className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
                  >
                    {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'reject')}
                    disabled={actionLoading === req.id}
                    className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
