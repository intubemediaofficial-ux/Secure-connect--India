'use client';

import { useState } from 'react';
import { Shield, Phone, Mail, Loader2, ArrowRight, UserPlus, ArrowLeft } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function ExpertLoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Registration fields
  const [regData, setRegData] = useState({
    name: '', email: '', phone: '', qualification: '', category: 'RELATIONSHIP',
    experience: '', perMinuteRate: '', bio: '', gender: 'MALE',
  });

  const categories = [
    'RELATIONSHIP', 'MARRIAGE', 'FAMILY', 'BREAKUP', 'LONELINESS',
    'PERSONAL_LIFE', 'EMOTIONAL_STRESS', 'PSYCHOLOGY', 'MENTAL_WELLNESS',
    'STRESS', 'ANXIETY', 'DEPRESSION', 'WOMEN_HEALTH', 'GENERAL_HEALTH',
  ];

  const handleSendOTP = async () => {
    if (phone.length !== 10) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.devOtp) setDevOtp(data.devOtp);
        setStep('otp');
      } else {
        setError(data.message || 'OTP send failed');
      }
    } catch {
      setError('Server se connect nahi ho paya');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/expert/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('expertToken', data.data.accessToken);
        localStorage.setItem('expert', JSON.stringify(data.data.expert));
        window.location.href = '/expert/dashboard';
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch {
      setError('Server se connect nahi ho paya');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.name || !regData.email || !regData.phone || !regData.qualification) {
      setError('All required fields fill karein');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/expert/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regData,
          experience: parseInt(regData.experience) || 0,
          perMinuteRate: parseFloat(regData.perMinuteRate) || 10,
          languages: ['hi', 'en'],
          specialization: [regData.category],
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('expertToken', data.data.accessToken);
        localStorage.setItem('expert', JSON.stringify(data.data.expert));
        window.location.href = '/expert/dashboard';
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Server se connect nahi ho paya');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <Shield className="w-10 h-10 text-emerald-400" />
            <span className="text-2xl font-bold text-white">SecureConnect</span>
          </div>
          <p className="text-emerald-300 mt-2">Expert Portal</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setStep('input'); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${mode === 'login' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${mode === 'register' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <>
              {step === 'input' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm">+91</span>
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter your phone"
                        className="w-full pl-14 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSendOTP}
                    disabled={phone.length !== 10 || loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {devOtp && (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-center">
                      <p className="text-xs text-emerald-300 mb-1">Development Mode - Your OTP</p>
                      <p className="text-2xl font-bold text-emerald-400 tracking-widest">{devOtp}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-emerald-200 mb-2">Enter 6-digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl tracking-widest placeholder-white/30 focus:ring-2 focus:ring-emerald-400 outline-none"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={otp.length !== 6 || loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                  <button onClick={() => { setStep('input'); setOtp(''); setDevOtp(''); }} className="w-full text-sm text-emerald-300 hover:text-white transition">
                    <ArrowLeft className="w-4 h-4 inline mr-1" /> Change Number
                  </button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-emerald-200 mb-1">Full Name *</label>
                  <input
                    value={regData.name}
                    onChange={(e) => setRegData(d => ({ ...d, name: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:ring-2 focus:ring-emerald-400 outline-none"
                    placeholder="Dr. Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-emerald-200 mb-1">Gender</label>
                  <select
                    value={regData.gender}
                    onChange={(e) => setRegData(d => ({ ...d, gender: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                  >
                    <option value="MALE" className="text-black">Male</option>
                    <option value="FEMALE" className="text-black">Female</option>
                    <option value="OTHER" className="text-black">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-200 mb-1">Email *</label>
                <input
                  type="email"
                  value={regData.email}
                  onChange={(e) => setRegData(d => ({ ...d, email: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder="expert@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-200 mb-1">Phone *</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={regData.phone}
                  onChange={(e) => setRegData(d => ({ ...d, phone: e.target.value.replace(/\D/g, '') }))}
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder="9876543210"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-200 mb-1">Qualification *</label>
                <input
                  value={regData.qualification}
                  onChange={(e) => setRegData(d => ({ ...d, qualification: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder="M.A. Psychology, MBBS etc."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-emerald-200 mb-1">Category *</label>
                  <select
                    value={regData.category}
                    onChange={(e) => setRegData(d => ({ ...d, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c} className="text-black">{c.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-emerald-200 mb-1">Experience (yrs)</label>
                  <input
                    type="number"
                    min={0}
                    value={regData.experience}
                    onChange={(e) => setRegData(d => ({ ...d, experience: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:ring-2 focus:ring-emerald-400 outline-none"
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-200 mb-1">Rate (₹/min)</label>
                <input
                  type="number"
                  min={1}
                  value={regData.perMinuteRate}
                  onChange={(e) => setRegData(d => ({ ...d, perMinuteRate: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:ring-2 focus:ring-emerald-400 outline-none"
                  placeholder="15"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-200 mb-1">Bio</label>
                <textarea
                  value={regData.bio}
                  onChange={(e) => setRegData(d => ({ ...d, bio: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                  placeholder="Brief description about yourself..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                {loading ? 'Registering...' : 'Register as Expert'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-4 text-sm text-emerald-300/60">
          <a href="/login" className="hover:text-white transition">User Login →</a>
        </p>
      </div>
    </div>
  );
}
