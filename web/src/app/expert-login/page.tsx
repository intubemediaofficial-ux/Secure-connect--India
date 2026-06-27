'use client';

import { useState } from 'react';
import { Shield, Phone, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const CATEGORIES = [
  'RELATIONSHIP', 'MARRIAGE', 'FAMILY', 'BREAKUP', 'LONELINESS',
  'PERSONAL_LIFE', 'EMOTIONAL_STRESS', 'PSYCHOLOGY', 'MENTAL_WELLNESS',
  'STRESS', 'ANXIETY', 'DEPRESSION', 'WOMEN_HEALTH', 'GENERAL_HEALTH',
];

export default function ExpertLoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const [regForm, setRegForm] = useState({
    name: '', email: '', phone: '', qualification: '',
    category: 'RELATIONSHIP', experience: '', perMinuteRate: '',
    bio: '', gender: 'MALE',
  });

  const handleSendOTP = async () => {
    if (phone.length !== 10) return;
    setError(''); setLoading(true);
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
    } catch { setError('Server se connect nahi ho paya'); } finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setError(''); setLoading(true);
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
    } catch { setError('Server se connect nahi ho paya'); } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/expert/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regForm,
          experience: Number(regForm.experience) || 0,
          perMinuteRate: Number(regForm.perMinuteRate) || 10,
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('expertToken', data.data.accessToken || data.data.token);
        localStorage.setItem('expert', JSON.stringify(data.data.expert));
        window.location.href = '/expert/dashboard';
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch { setError('Server se connect nahi ho paya'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950" style={{ backgroundImage: 'radial-gradient(at 20% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(at 80% 70%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">SecureConnect</span>
              <p className="text-xs text-gray-500">Expert Portal</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-white/[0.05] rounded-xl p-1 mb-6 border border-white/[0.08]">
            <button onClick={() => setTab('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                tab === 'login' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-500 hover:text-gray-300'
              }`}>Login</button>
            <button onClick={() => setTab('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                tab === 'register' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-500 hover:text-gray-300'
              }`}>Register</button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-emergency-500/10 border border-emergency-500/20 rounded-xl text-emergency-400 text-sm text-center">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            step === 'phone' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <div className="flex">
                    <div className="flex items-center px-4 bg-white/[0.06] border border-white/[0.12] border-r-0 rounded-l-xl">
                      <Phone className="w-4 h-4 text-gray-500 mr-1.5" />
                      <span className="text-sm text-gray-400">+91</span>
                    </div>
                    <input type="tel" maxLength={10} value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter your phone" className="input-field rounded-l-none" />
                  </div>
                </div>
                <button onClick={handleSendOTP} disabled={phone.length !== 10 || loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/30">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {devOtp && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                    <p className="text-xs text-emerald-400 mb-1">Dev Mode - OTP</p>
                    <p className="text-2xl font-bold text-emerald-300 tracking-widest">{devOtp}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Enter 6-digit OTP</label>
                  <input type="text" maxLength={6} value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000" className="input-field text-center text-2xl tracking-widest" autoFocus />
                </div>
                <button onClick={handleVerifyOTP} disabled={otp.length !== 6 || loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/30">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
                <button onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                  className="text-sm text-gray-500 hover:text-gray-300 w-full text-center transition">Change phone number</button>
              </div>
            )
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Full Name *</label>
                  <input value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})}
                    required placeholder="Dr. Name" className="input-field text-sm py-2.5" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Gender</label>
                  <select value={regForm.gender} onChange={e => setRegForm({...regForm, gender: e.target.value})}
                    className="input-field text-sm py-2.5">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email *</label>
                <input type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})}
                  required placeholder="expert@email.com" className="input-field text-sm py-2.5" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Phone *</label>
                <input type="tel" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})}
                  required placeholder="9876543210" className="input-field text-sm py-2.5" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Qualification *</label>
                <input value={regForm.qualification} onChange={e => setRegForm({...regForm, qualification: e.target.value})}
                  required placeholder="M.A. Psychology, MBBS etc." className="input-field text-sm py-2.5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Category *</label>
                  <select value={regForm.category} onChange={e => setRegForm({...regForm, category: e.target.value})}
                    className="input-field text-sm py-2.5">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Experience (yrs)</label>
                  <input type="number" value={regForm.experience} onChange={e => setRegForm({...regForm, experience: e.target.value})}
                    placeholder="5" className="input-field text-sm py-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Rate (₹/min)</label>
                <input type="number" value={regForm.perMinuteRate} onChange={e => setRegForm({...regForm, perMinuteRate: e.target.value})}
                  placeholder="15" className="input-field text-sm py-2.5" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Bio</label>
                <textarea value={regForm.bio} onChange={e => setRegForm({...regForm, bio: e.target.value})}
                  placeholder="Brief description about yourself..." className="input-field text-sm py-2.5 h-16 resize-none" />
              </div>

              <button type="submit" disabled={loading || !regForm.name || !regForm.email || !regForm.phone || !regForm.qualification}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/30">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                {loading ? 'Registering...' : 'Register as Expert'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-300 transition">
            User Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
