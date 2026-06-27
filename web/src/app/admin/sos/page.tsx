'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, MapPin, Clock, Phone, Shield, ChevronLeft, ChevronRight, Loader2, ExternalLink } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface SOSAlert {
  id: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  triggerMethod: string;
  status: string;
  audioUrl: string | null;
  photoUrl: string | null;
  videoUrl: string | null;
  resolvedAt: string | null;
  deactivationReason: string | null;
  createdAt: string;
  user?: { id: string; name?: string; phone: string; email?: string };
}

export default function AdminSOSPage() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'RESOLVED' | 'ESCALATED'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const limit = 10;

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filter !== 'all') params.set('status', filter);

      const res = await fetch(`${API_BASE}/api/admin/sos?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(data.data.alerts || []);
        setTotal(data.data.total || 0);
      }
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleEscalate = async (alertId: string) => {
    setActionLoading(alertId);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE}/api/admin/sos/${alertId}/escalate`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAlerts();
    } catch { /* ignore */ } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    ACTIVE: { bg: 'bg-emergency-500/20', text: 'text-emergency-400', dot: 'bg-emergency-500' },
    RESOLVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    ESCALATED: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
    FALSE_ALARM: { bg: 'bg-white/[0.06]', text: 'text-gray-400', dot: 'bg-gray-400' },
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'ACTIVE', 'RESOLVED', 'ESCALATED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === f
                    ? f === 'ACTIVE' ? 'bg-emergency-500/20 text-emergency-400 border border-emergency-500/30' : 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-white/[0.05] text-gray-400 border border-white/[0.08] hover:bg-white/[0.08]'
                }`}
              >
                {f === 'all' ? 'All Alerts' : f}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">Total: {total} alerts</p>
        </div>
      </div>

      {/* Alerts */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No SOS alerts found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const sc = statusConfig[alert.status] || statusConfig.FALSE_ALARM;
            return (
              <div key={alert.id} className={`card border-l-4 ${alert.status === 'ACTIVE' ? 'border-l-red-500' : alert.status === 'ESCALATED' ? 'border-l-amber-500' : 'border-l-green-500'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className={`w-5 h-5 ${alert.status === 'ACTIVE' ? 'text-emergency-400' : 'text-gray-400'}`} />
                      <div>
                        <h3 className="font-semibold text-white">{alert.user?.name || 'Unknown User'}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {alert.user?.phone}
                          {alert.user?.email && <span> | {alert.user.email}</span>}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {alert.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Trigger: {alert.triggerMethod}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(alert.createdAt).toLocaleString('en-IN')}</span>
                      </div>
                      {alert.latitude && alert.longitude && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          <a
                            href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:underline flex items-center gap-0.5"
                          >
                            View Location <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {alert.resolvedAt && (
                        <div className="text-gray-500">
                          Resolved: {new Date(alert.resolvedAt).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    {alert.deactivationReason && (
                      <p className="text-sm text-gray-500 mt-1">Reason: {alert.deactivationReason}</p>
                    )}

                    {(alert.audioUrl || alert.photoUrl || alert.videoUrl) && (
                      <div className="flex gap-2 mt-2">
                        {alert.audioUrl && <a href={alert.audioUrl} className="text-xs text-primary-400 hover:underline">Audio Evidence</a>}
                        {alert.photoUrl && <a href={alert.photoUrl} className="text-xs text-primary-400 hover:underline">Photo Evidence</a>}
                        {alert.videoUrl && <a href={alert.videoUrl} className="text-xs text-primary-400 hover:underline">Video Evidence</a>}
                      </div>
                    )}
                  </div>

                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleEscalate(alert.id)}
                      disabled={actionLoading === alert.id}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition flex items-center gap-1 whitespace-nowrap"
                    >
                      {actionLoading === alert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                      Escalate
                    </button>
                  )}
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
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] disabled:opacity-30 text-gray-400">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] disabled:opacity-30 text-gray-400">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
