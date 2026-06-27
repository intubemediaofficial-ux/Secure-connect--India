'use client';

import { useState } from 'react';
import { Shield, Phone, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendOTP = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    // API call to send OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    // API call to verify OTP
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/dashboard';
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-emergency-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Shield className="w-10 h-10 text-primary-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              SecureConnect
            </span>
          </Link>
          <p className="text-gray-500 mt-2">Your Safety, Our Priority</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-center mb-2">
            {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
          </h2>
          <p className="text-gray-500 text-center mb-8">
            {step === 'phone'
              ? 'Enter your phone number to continue'
              : `OTP sent to +91 ${phone}`
            }
          </p>

          {step === 'phone' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="flex">
                  <div className="flex items-center px-4 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-xl">
                    <span className="text-sm font-medium">+91</span>
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

              <button
                onClick={handleSendOTP}
                disabled={phone.length !== 10 || loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Enter 6-digit OTP</label>
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
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">Resend OTP in {countdown}s</p>
                ) : (
                  <button onClick={handleSendOTP} className="text-sm text-primary-600 font-medium hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={() => { setStep('phone'); setOtp(''); }}
                className="text-sm text-gray-500 hover:text-gray-700 w-full text-center"
              >
                Change phone number
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
              Your data is encrypted and secure.
            </p>
          </div>
        </div>

        {/* Expert Login */}
        <div className="mt-4 text-center">
          <Link href="/expert-login" className="text-sm text-primary-600 hover:underline">
            Expert? Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
