'use client';

import { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function WalletPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const rechargeOptions = [99, 199, 499, 999, 1999, 4999];

  const transactions = [
    { id: '1', type: 'RECHARGE', amount: 499, status: 'completed', date: '2024-01-15', description: 'Wallet Recharge' },
    { id: '2', type: 'CONSULTATION_DEBIT', amount: -150, status: 'completed', date: '2024-01-14', description: 'Consultation - Dr. Sharma' },
    { id: '3', type: 'RECHARGE', amount: 199, status: 'completed', date: '2024-01-10', description: 'Wallet Recharge' },
    { id: '4', type: 'CONSULTATION_DEBIT', amount: -85, status: 'completed', date: '2024-01-09', description: 'Chat - Counselor Priya' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6 lg:ml-72">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Wallet</h1>
            <p className="text-gray-500">Manage your balance and transactions</p>
          </div>
          <Link href="/dashboard" className="text-primary-600 hover:underline text-sm">Dashboard</Link>
        </div>

        {/* Balance Card */}
        <div className="card bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 border-none text-white p-8">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-6 h-6 text-primary-200" />
            <span className="text-primary-100">Available Balance</span>
          </div>
          <p className="text-4xl font-bold mb-1">₹463.00</p>
          <p className="text-primary-200 text-sm">Last recharge: ₹499 on Jan 15</p>
        </div>

        {/* Recharge Section */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Quick Recharge</h3>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {rechargeOptions.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`p-3 rounded-xl border-2 transition text-center font-semibold ${
                  selectedAmount === amount
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                ₹{amount}
              </button>
            ))}
          </div>

          {selectedAmount && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-lg">₹{selectedAmount}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 p-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition">
                  <CreditCard className="w-5 h-5" />
                  Card / UPI
                </button>
                <button className="flex items-center justify-center gap-2 p-4 border-2 border-primary-600 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition">
                  <Smartphone className="w-5 h-5" />
                  Razorpay
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Transactions</h3>
            <button className="text-primary-600 text-sm hover:underline">View All</button>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-orange-100 dark:bg-orange-900/20'
                  }`}>
                    {tx.amount > 0
                      ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      : <ArrowUpRight className="w-5 h-5 text-orange-600" />
                    }
                  </div>
                  <div>
                    <div className="font-medium text-sm">{tx.description}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {tx.date}
                    </div>
                  </div>
                </div>
                <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
