'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, ArrowDownToLine, Wallet, Loader2, CheckCircle, Info } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function ExpertEarningsPage() {
  const [balance, setBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = localStorage.getItem('expertToken');
        const res = await fetch(`${API_BASE}/api/experts/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          setBalance(data.data.stats?.balance || 0);
          setTotalEarnings(data.data.stats?.totalEarnings || 0);
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchEarnings();
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    setWithdrawing(true);
    setMessage('');
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/withdraw`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(withdrawAmount) }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Withdrawal request submitted!');
        setWithdrawAmount('');
        setBalance(prev => prev - Number(withdrawAmount));
      } else {
        setMessage(data.message || 'Withdrawal failed');
      }
    } catch { setMessage('Server error'); } finally { setWithdrawing(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Wallet & Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="stat-card bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-xl shadow-emerald-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Wallet className="w-6 h-6 text-emerald-300" />
            </div>
          </div>
          <p className="text-sm text-emerald-200">Wallet Balance</p>
          <p className="text-3xl font-bold text-white mt-1">₹{balance.toFixed(2)}</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-purple-600 to-purple-800 shadow-xl shadow-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-300" />
            </div>
          </div>
          <p className="text-sm text-purple-200">Total Earnings</p>
          <p className="text-3xl font-bold text-white mt-1">₹{totalEarnings.toLocaleString()}</p>
        </div>
      </div>

      {/* Revenue Split */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary-400" />
          Revenue Split
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Expert Share</span>
              <span className="text-emerald-400 font-bold">80%</span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '80%' }} />
            </div>
          </div>
          <div className="w-px h-12 bg-white/[0.08]" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Platform Fee</span>
              <span className="text-amber-400 font-bold">20%</span>
            </div>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{ width: '20%' }} />
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">Example: If user pays ₹100, you get ₹80, platform keeps ₹20</p>
      </div>

      {/* Withdrawal */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
          Withdraw Earnings
        </h3>

        {message && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {message}
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative flex-1">
            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="number"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount"
              className="input-field pl-10"
              min="0"
              max={balance}
            />
          </div>
          <button onClick={handleWithdraw} disabled={withdrawing || !withdrawAmount || Number(withdrawAmount) <= 0}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium px-6 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50">
            {withdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowDownToLine className="w-5 h-5" />}
            Withdraw
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">Minimum withdrawal: ₹100. Processing time: 24-48 hours.</p>
      </div>
    </div>
  );
}
