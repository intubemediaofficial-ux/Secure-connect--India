'use client';

import { useState, useCallback } from 'react';
import { Shield, Phone, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  const startCountdown = useCallback(() => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendOTP = async () => {
    setError('');
    if (loginMethod === 'phone' && phone.length !== 10) return;
    if (loginMethod === 'email' && !email.includes('@')) return;
    setLoading(true);
    try {
      const endpoint = loginMethod === 'phone' ? '/auth/send-otp' : '/auth/send-email-otp';
      const body = loginMethod === 'phone' ? { phone } : { email };
      const res = await fetch(`${API_BASE}/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        if (data.devOtp) setDevOtp(data.devOtp);
        setStep('otp');
        startCountdown();
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch {
      setError('Server se connect nahi ho paya. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      const endpoint = loginMethod === 'phone' ? '/auth/verify-otp' : '/auth/verify-email-otp';
      const body = loginMethod === 'phone' ? { phone, otp } : { email, otp };
      const res = await fetch(`${API_BASE}/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch {
      setError('Server se connect nahi ho paya. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    try {
      await handleSendOTP();
    } finally {
      setLoading(false);
    }
  };

  const displayTarget = loginMethod === 'phone' ? `+91 ${phone}` : email;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950" style={{ backgroundImage: 'radial-gradient(at 30% 20%, rgba(76, 110, 245, 0.1) 0%, transparent 50%), radial-gradient(at 70% 80%, rgba(239, 68, 68, 0.06) 0%, transparent 50%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold gradient-text">SecureConnect</span>
              <p className="text-xs text-gray-500">Your Safety, Our Priority</p>
            </div>
          </Link>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            {step === 'input' ? 'Welcome Back' : 'Verify OTP'}
          </h2>
          <p className="text-gray-500 text-center mb-6">
            {step === 'input' ? 'Login with your phone number or email' : `OTP sent to ${displayTarget}`}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-emergency-500/10 border border-emergency-500/20 rounded-xl text-emergency-400 text-sm text-center">
              {error}
            </div>
          )}

          {step === 'input' ? (
            <div className="space-y-4">
              {/* Login Method Tabs */}
              <div className="flex bg-white/[0.05] rounded-xl p-1 border border-white/[0.08]">
                <button
                  onClick={() => { setLoginMethod('phone'); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    loginMethod === 'phone'
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Phone
                </button>
                <button
                  onClick={() => { setLoginMethod('email'); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    loginMethod === 'email'
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>

              {loginMethod === 'phone' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <div className="flex">
                    <div className="flex items-center px-4 bg-white/[0.06] border border-white/[0.12] border-r-0 rounded-l-xl">
                      <span className="text-sm font-medium text-gray-400">+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10 digit number"
                      className="input-field rounded-l-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="input-field pl-12"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={(loginMethod === 'phone' && phone.length !== 10) || (loginMethod === 'email' && !email.includes('@')) || loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : loginMethod === 'phone' ? <Phone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {devOtp && (
                <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl text-center">
                  <p className="text-xs text-primary-400 mb-1">Development Mode - Your OTP</p>
                  <p className="text-2xl font-bold text-primary-300 tracking-widest">{devOtp}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Enter 6-digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="input-field text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary-500/30"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">Resend OTP in {countdown}s</p>
                ) : (
                  <button onClick={handleResendOTP} className="text-sm text-primary-400 font-medium hover:text-primary-300">
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={() => { setStep('input'); setOtp(''); setError(''); }}
                className="text-sm text-gray-500 hover:text-gray-300 w-full text-center transition"
              >
                {loginMethod === 'phone' ? 'Change phone number' : 'Change email address'}
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <p className="text-xs text-gray-600 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
              Your data is encrypted and secure.
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/expert-login" className="text-sm text-primary-400 hover:text-primary-300 transition">
            Expert? Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
