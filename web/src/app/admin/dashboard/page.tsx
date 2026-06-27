'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, AlertTriangle, MessageSquare, IndianRupee, TrendingUp, Activity, Clock } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface DashboardStats {
  totalUsers: number;
  totalExperts: number;
  activeAlerts: number;
  totalConsultations: number;
  totalRevenue: number;
  monthlyRevenue: number;
  recentAlerts: Array<{
    id: string;
    status: string;
    triggerMethod: string;
    createdAt: string;
    user?: { name?: string; phone: string };
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {
      // Use placeholder data for demo
      setStats({
        totalUsers: 0,
        totalExperts: 0,
        activeAlerts: 0,
        totalConsultations: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        recentAlerts: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Experts', value: stats?.totalExperts || 0, icon: UserCheck, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: 'Active SOS Alerts', value: stats?.activeAlerts || 0, icon: AlertTriangle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    { label: 'Total Consultations', value: stats?.totalConsultations || 0, icon: MessageSquare, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Monthly Revenue', value: `₹${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent SOS Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Recent SOS Alerts
            </h3>
            <a href="/admin/sos" className="text-sm text-primary-600 hover:underline">View All</a>
          </div>
          {stats?.recentAlerts && stats.recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {stats.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium">{alert.user?.name || alert.user?.phone || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500">Trigger: {alert.triggerMethod}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      alert.status === 'ACTIVE' ? 'bg-red-100 text-red-700' :
                      alert.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {alert.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No recent alerts</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/admin/users" className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Manage Users</p>
            </a>
            <a href="/admin/experts" className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition">
              <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Verify Experts</p>
            </a>
            <a href="/admin/sos" className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-center hover:bg-red-100 dark:hover:bg-red-900/30 transition">
              <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">SOS Monitor</p>
            </a>
            <a href="/admin/revenue" className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
              <IndianRupee className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Revenue</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
