'use client';

import { useState } from 'react';
import { Shield, Mail, Lock, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('admin', JSON.stringify(data.data.admin));
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Server se connect nahi ho paya');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950" style={{ backgroundImage: 'radial-gradient(at 20% 20%, rgba(76, 110, 245, 0.1) 0%, transparent 50%), radial-gradient(at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold gradient-text">SecureConnect</span>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white text-center mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-400" />
            Admin Login
          </h2>
          <p className="text-gray-500 text-sm text-center mb-6">Enter your credentials to continue</p>

          {error && (
            <div className="mb-4 p-3 bg-emergency-500/10 border border-emergency-500/20 rounded-xl text-emergency-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@secureconnect.in"
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-field pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
