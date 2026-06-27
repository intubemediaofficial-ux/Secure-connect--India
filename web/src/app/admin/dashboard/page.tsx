'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, AlertTriangle, MessageSquare, IndianRupee, TrendingUp, Clock, MapPin, Loader2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, experts: 0, activeSOS: 0, consultations: 0, revenue: 0, monthlyRevenue: 0 });
  const [recentSOS, setRecentSOS] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, expertsRes, sosRes, consultationsRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/users?limit=1`, { headers }).then(r => r.json()).catch(() => ({ data: { total: 0 } })),
          fetch(`${API_BASE}/api/admin/experts?limit=1`, { headers }).then(r => r.json()).catch(() => ({ data: { total: 0 } })),
          fetch(`${API_BASE}/api/admin/sos?limit=5`, { headers }).then(r => r.json()).catch(() => ({ data: { alerts: [], total: 0 } })),
          fetch(`${API_BASE}/api/admin/consultations?limit=1`, { headers }).then(r => r.json()).catch(() => ({ data: { total: 0 } })),
        ]);

        setStats({
          users: usersRes?.data?.total || 0,
          experts: expertsRes?.data?.total || 0,
          activeSOS: sosRes?.data?.total || 0,
          consultations: consultationsRes?.data?.total || 0,
          revenue: 0,
          monthlyRevenue: 0,
        });
        setRecentSOS(sosRes?.data?.alerts?.slice(0, 3) || []);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, gradient: 'from-blue-600 to-blue-800', shadow: 'shadow-blue-500/20', iconColor: 'text-blue-300' },
    { label: 'Total Experts', value: stats.experts, icon: UserCheck, gradient: 'from-emerald-600 to-emerald-800', shadow: 'shadow-emerald-500/20', iconColor: 'text-emerald-300' },
    { label: 'Active SOS', value: stats.activeSOS, icon: AlertTriangle, gradient: 'from-emergency-600 to-emergency-800', shadow: 'shadow-emergency-500/20', iconColor: 'text-emergency-300' },
    { label: 'Consultations', value: stats.consultations, icon: MessageSquare, gradient: 'from-purple-600 to-purple-800', shadow: 'shadow-purple-500/20', iconColor: 'text-purple-300' },
    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, gradient: 'from-amber-600 to-amber-800', shadow: 'shadow-amber-500/20', iconColor: 'text-amber-300' },
    { label: 'Monthly Revenue', value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: TrendingUp, gradient: 'from-cyan-600 to-cyan-800', shadow: 'shadow-cyan-500/20', iconColor: 'text-cyan-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(s => (
          <div key={s.label} className={`stat-card bg-gradient-to-br ${s.gradient} ${s.shadow} shadow-xl`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 bg-white/10 rounded-xl`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/40" />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-white/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent SOS Alerts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-emergency-400" />
            Recent SOS Alerts
          </h3>
          <Link href="/admin/sos" className="text-sm text-primary-400 hover:text-primary-300 transition">
            View All →
          </Link>
        </div>
        {recentSOS.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No recent SOS alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSOS.map((alert: any) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] hover:border-emergency-500/20 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emergency-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-emergency-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">{alert.user?.name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-500">{alert.triggerMethod || 'SOS Button'}</p>
                  </div>
                </div>
                <span className={`badge ${
                  alert.status === 'ACTIVE' ? 'bg-emergency-500/20 text-emergency-400 border border-emergency-500/30' :
                  alert.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {alert.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Manage Users', href: '/admin/users', icon: Users, gradient: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20 hover:border-blue-400/40', text: 'text-blue-400' },
          { label: 'Manage Experts', href: '/admin/experts', icon: UserCheck, gradient: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20 hover:border-emerald-400/40', text: 'text-emerald-400' },
          { label: 'Revenue Report', href: '/admin/revenue', icon: IndianRupee, gradient: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20 hover:border-amber-400/40', text: 'text-amber-400' },
          { label: 'Settings', href: '/admin/settings', icon: MessageSquare, gradient: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/20 hover:border-purple-400/40', text: 'text-purple-400' },
        ].map(a => (
          <Link key={a.label} href={a.href} className={`card-glow bg-gradient-to-br ${a.gradient} border ${a.border} p-5 text-center hover:scale-[1.02] transition-all duration-300`}>
            <a.icon className={`w-8 h-8 mx-auto mb-3 ${a.text}`} />
            <p className={`text-sm font-semibold ${a.text}`}>{a.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
