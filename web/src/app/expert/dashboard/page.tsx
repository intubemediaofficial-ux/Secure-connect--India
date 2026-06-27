'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, IndianRupee, Clock, Users, TrendingUp, CheckCircle, XCircle, Loader2, ArrowUpRight, Sparkles } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface DashboardData {
  expert: { name: string; category: string; rating: number; totalConsultations: number; isVerified: boolean; isOnline: boolean };
  stats: { todayConsultations: number; pendingRequests: number; balance: number; totalEarnings: number };
}

interface PendingRequest {
  id: string; category: string; mode: string; isAnonymous: boolean; createdAt: string;
  user?: { name?: string; avatar?: string };
}

export default function ExpertDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { fetchDashboard(); fetchPending(); }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/consultations?status=PENDING`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) setPending(result.data.consultations || []);
    } catch { /* ignore */ }
  };

  const handleAction = async (consultationId: string, action: 'accept' | 'reject') => {
    setActionLoading(consultationId);
    try {
      const token = localStorage.getItem('expertToken');
      await fetch(`${API_BASE}/api/consultations/${consultationId}/${action}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      fetchPending(); fetchDashboard();
    } catch { /* ignore */ } finally { setActionLoading(null); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;
  }

  const stats = [
    { label: "Today's Sessions", value: data?.stats.todayConsultations || 0, icon: MessageSquare, gradient: 'from-blue-600 to-blue-800', shadow: 'shadow-blue-500/20', iconColor: 'text-blue-300' },
    { label: 'Pending Requests', value: data?.stats.pendingRequests || 0, icon: Clock, gradient: 'from-amber-600 to-amber-800', shadow: 'shadow-amber-500/20', iconColor: 'text-amber-300' },
    { label: 'Wallet Balance', value: `₹${(data?.stats.balance || 0).toFixed(2)}`, icon: IndianRupee, gradient: 'from-emerald-600 to-emerald-800', shadow: 'shadow-emerald-500/20', iconColor: 'text-emerald-300' },
    { label: 'Total Earnings', value: `₹${(data?.stats.totalEarnings || 0).toLocaleString()}`, icon: TrendingUp, gradient: 'from-purple-600 to-purple-800', shadow: 'shadow-purple-500/20', iconColor: 'text-purple-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 shadow-2xl shadow-emerald-500/20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Welcome, {data?.expert.name || 'Expert'}!
            </h2>
            <p className="text-emerald-100 mt-1">{data?.expert.category?.replace('_', ' ')} | Rating: {data?.expert.rating?.toFixed(1) || '0.0'} ★</p>
          </div>
          {data?.expert.isVerified ? (
            <span className="flex items-center gap-1.5 bg-white/20 px-4 py-2 rounded-full text-sm text-white font-medium border border-white/20">
              <CheckCircle className="w-4 h-4" /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-amber-500/30 px-4 py-2 rounded-full text-sm text-amber-100 font-medium border border-amber-400/30">
              <Clock className="w-4 h-4" /> Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`stat-card bg-gradient-to-br ${s.gradient} ${s.shadow} shadow-xl`}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/40" />
            </div>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-white/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Requests */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          Pending Consultation Requests
        </h3>
        {pending.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No pending requests</p>
            <p className="text-xs mt-1 text-gray-600">New requests will appear here when users book you</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">{req.isAnonymous ? 'Anonymous User' : req.user?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{req.category.replace('_', ' ')} | {req.mode} | {new Date(req.createdAt).toLocaleTimeString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(req.id, 'accept')} disabled={actionLoading === req.id}
                    className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-500/20">
                    {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Accept
                  </button>
                  <button onClick={() => handleAction(req.id, 'reject')} disabled={actionLoading === req.id}
                    className="flex items-center gap-1 px-4 py-2 bg-emergency-500/20 text-emergency-400 rounded-lg text-sm font-medium hover:bg-emergency-500/30 transition border border-emergency-500/30">
                    <XCircle className="w-4 h-4" /> Reject
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
