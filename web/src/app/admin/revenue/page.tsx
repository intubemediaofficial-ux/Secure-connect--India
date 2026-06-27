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
    RECHARGE: { icon: ArrowUpRight, color: 'text-green-600 bg-green-50' },
    CONSULTATION_DEBIT: { icon: TrendingDown, color: 'text-red-600 bg-red-50' },
    REFUND: { icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
  };

  return (
    <div className="space-y-6">
      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <IndianRupee className="w-6 h-6" />
            </div>
            <p className="text-green-100">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold">₹{(revenue?.totalRevenue || 0).toLocaleString()}</p>
        </div>

        <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-primary-100">Platform Fees (20%)</p>
          </div>
          <p className="text-3xl font-bold">₹{(revenue?.platformFees || 0).toLocaleString()}</p>
        </div>

        <div className="card bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
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
          <h3 className="font-semibold mb-4">Monthly Revenue Breakdown</h3>
          <div className="space-y-3">
            {revenue.monthlyRevenue.map((m) => (
              <div key={m.month} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="font-medium">{m.month}</p>
                <div className="flex gap-6 text-sm">
                  <span className="text-gray-600">Revenue: <strong>₹{m.revenue.toLocaleString()}</strong></span>
                  <span className="text-green-600">Platform Fee: <strong>₹{m.platformFee.toLocaleString()}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="card">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
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
                const config = txTypeColors[tx.type] || { icon: CreditCard, color: 'text-gray-600 bg-gray-50' };
                const Icon = config.icon;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">
                          {tx.user?.name || tx.user?.phone || '-'} | {tx.description || ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === 'RECHARGE' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'RECHARGE' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30">
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
