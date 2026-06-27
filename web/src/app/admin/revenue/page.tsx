'use client';

import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface RevenueData {
  totalRevenue: number;
  platformFees: number;
  monthlyRevenue: Array<{ month: string; revenue: number; platformFee: number }>;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
  user?: { name?: string; phone: string };
}

export default function AdminRevenuePage() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalTx, setTotalTx] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/admin/revenue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRevenue(data.data);
    } catch {
      setRevenue({ totalRevenue: 0, platformFees: 0, monthlyRevenue: [] });
    }
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });

      const res = await fetch(`${API_BASE}/api/admin/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.transactions || []);
        setTotalTx(data.data.total || 0);
      }
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const totalPages = Math.ceil(totalTx / limit);

  const txTypeColors: Record<string, { icon: typeof TrendingUp; color: string }> = {
    RECHARGE: { icon: ArrowUpRight, color: 'text-emerald-400 bg-emerald-500/20' },
    CONSULTATION_DEBIT: { icon: TrendingDown, color: 'text-emergency-400 bg-emergency-500/20' },
    REFUND: { icon: CreditCard, color: 'text-blue-400 bg-blue-500/20' },
  };

  return (
    <div className="space-y-6">
      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-xl shadow-emerald-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <IndianRupee className="w-6 h-6" />
            </div>
            <p className="text-emerald-200">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold">₹{(revenue?.totalRevenue || 0).toLocaleString()}</p>
        </div>

        <div className="stat-card bg-gradient-to-br from-primary-600 to-primary-800 shadow-xl shadow-primary-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-primary-100">Platform Fees (20%)</p>
          </div>
          <p className="text-3xl font-bold">₹{(revenue?.platformFees || 0).toLocaleString()}</p>
        </div>

        <div className="stat-card bg-gradient-to-br from-amber-600 to-amber-800 shadow-xl shadow-amber-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-amber-100">Total Transactions</p>
          </div>
          <p className="text-3xl font-bold">{totalTx}</p>
        </div>
      </div>

      {/* Monthly Revenue */}
      {revenue?.monthlyRevenue && revenue.monthlyRevenue.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Monthly Revenue Breakdown</h3>
          <div className="space-y-3">
            {revenue.monthlyRevenue.map((m) => (
              <div key={m.month} className="flex items-center justify-between p-3 bg-white/[0.04] border border-white/[0.06] rounded-xl">
                <p className="font-medium text-gray-200">{m.month}</p>
                <div className="flex gap-6 text-sm">
                  <span className="text-gray-400">Revenue: <strong>₹{m.revenue.toLocaleString()}</strong></span>
                  <span className="text-emerald-400">Platform Fee: <strong>₹{m.platformFee.toLocaleString()}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">Recent Transactions</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {transactions.map((tx) => {
                const config = txTypeColors[tx.type] || { icon: CreditCard, color: 'text-gray-400 bg-white/[0.06]' };
                const Icon = config.icon;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-white/[0.04] border border-white/[0.06] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">{tx.type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">
                          {tx.user?.name || tx.user?.phone || '-'} | {tx.description || ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === 'RECHARGE' ? 'text-emerald-400' : 'text-emergency-400'}`}>
                        {tx.type === 'RECHARGE' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                );
              })}
            </div>

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
          </>
        )}
      </div>
    </div>
  );
}
