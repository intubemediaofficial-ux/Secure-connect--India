'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2, Wallet, Send } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface WalletData {
  balance: number;
  totalEarnings: number;
}

interface Earning {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

export default function ExpertEarningsPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchWallet(); }, []);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.wallet) {
        setWallet(data.data.wallet);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) return;
    if (wallet && amt > wallet.balance) {
      setMessage('Insufficient balance');
      return;
    }

    setWithdrawing(true);
    setMessage('');
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/withdraw`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Withdrawal request submitted!');
        setWithdrawAmount('');
        fetchWallet();
      } else {
        setMessage(data.message || 'Withdrawal failed');
      }
    } catch {
      setMessage('Server error. Try again later.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-emerald-100">Available Balance</p>
          </div>
          <p className="text-3xl font-bold">₹{(wallet?.balance || 0).toFixed(2)}</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-purple-100">Total Earnings</p>
          </div>
          <p className="text-3xl font-bold">₹{(wallet?.totalEarnings || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* How Earnings Work */}
      <div className="card">
        <h3 className="font-semibold mb-3">How Earnings Work</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-600">80%</p>
            <p className="text-xs text-blue-600">You Earn</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
            <p className="text-2xl font-bold text-amber-600">20%</p>
            <p className="text-xs text-amber-600">Platform Fee</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-600">Per Min</p>
            <p className="text-xs text-green-600">Billing Method</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Example: 10 min consultation at ₹15/min = ₹150 total. You earn ₹120, platform gets ₹30.
        </p>
      </div>

      {/* Withdraw */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-emerald-500" />
          Request Withdrawal
        </h3>

        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm text-center ${
            message.includes('submitted') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative flex-1">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              min={100}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount (min ₹500)"
              className="input-field pl-9"
            />
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || !withdrawAmount}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
          >
            {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Withdraw
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Withdrawals are processed to your UPI/Bank account within 2-3 business days.
          Make sure your payment details are updated in Profile.
        </p>
      </div>

      {/* Earnings Breakdown */}
      <div className="card">
        <h3 className="font-semibold mb-4">Recent Earnings</h3>
        <div className="text-center py-8 text-gray-400">
          <IndianRupee className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>Earnings will appear here after consultations</p>
        </div>
      </div>
    </div>
  );
}
