'use client';

import { useState } from 'react';
import { Shield, Phone, Heart, Users, AlertTriangle, MessageCircle, Clock, Star, ChevronRight, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                SecureConnect
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Features</a>
              <a href="#safety" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Safety</a>
              <a href="#consultation" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Consultation</a>
              <a href="#download" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Download</a>
              <Link href="/login" className="btn-primary text-sm">Get Started</Link>
            </div>

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-600 dark:text-gray-300">Features</a>
              <a href="#safety" className="text-gray-600 dark:text-gray-300">Safety</a>
              <a href="#consultation" className="text-gray-600 dark:text-gray-300">Consultation</a>
              <Link href="/login" className="btn-primary text-center">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emergency-50 dark:bg-emergency-900/20 text-emergency-600 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <AlertTriangle className="w-4 h-4" />
            Emergency SOS - Always Free
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Your Safety,{' '}
            <span className="bg-gradient-to-r from-primary-600 to-emergency-500 bg-clip-text text-transparent">
              Our Priority
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
            India ka sabse trusted platform - Emergency safety, personal consultation,
            mental wellness aur women&apos;s health guidance. Ek app mein sab kuch.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/login" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
              Start Free - Download App
            </Link>
            <a href="#features" className="btn-outline text-lg px-8 py-4 w-full sm:w-auto">
              Explore Features
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '24/7', label: 'Emergency Support' },
              { value: '500+', label: 'Verified Experts' },
              { value: '100%', label: 'Confidential' },
              { value: '5km', label: 'Nearby Alerts' },
            ].map((stat) => (
              <div key={stat.label} className="card text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Competitors se zyada features, better security, aur faster response time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: AlertTriangle,
                title: 'Emergency SOS',
                description: 'Power button, shake, ya voice se SOS activate. Live location, audio/video recording auto-start.',
                color: 'emergency',
                badge: 'FREE',
              },
              {
                icon: MessageCircle,
                title: 'Personal Consultation',
                description: 'Relationship, marriage, family problems ke experts se chat ya call. Per minute billing.',
                color: 'primary',
                badge: 'PAID',
              },
              {
                icon: Heart,
                title: 'Mental Wellness',
                description: 'Licensed psychologists se stress, anxiety, depression ke liye guidance. Anonymous option.',
                color: 'primary',
                badge: 'PAID',
              },
              {
                icon: Users,
                title: "Women's Health",
                description: 'Certified doctors se period problems, PCOS, pregnancy queries. 100% confidential.',
                color: 'primary',
                badge: 'PAID',
              },
              {
                icon: Shield,
                title: 'Safety Check-ins',
                description: 'Schedule safety check-ins. Miss karne par automatic alert trusted contacts ko.',
                color: 'emergency',
                badge: 'FREE',
              },
              {
                icon: Phone,
                title: 'Fake Call',
                description: 'Uncomfortable situation mein fake incoming call generate. Escape ka easy way.',
                color: 'emergency',
                badge: 'FREE',
              },
            ].map((feature) => (
              <div key={feature.title} className="card hover:shadow-xl transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    feature.color === 'emergency' ? 'bg-emergency-50 dark:bg-emergency-900/20' : 'bg-primary-50 dark:bg-primary-900/20'
                  }`}>
                    <feature.icon className={`w-6 h-6 ${
                      feature.color === 'emergency' ? 'text-emergency-600' : 'text-primary-600'
                    }`} />
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    feature.badge === 'FREE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  }`}>
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOS Section */}
      <section id="safety" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emergency-50 dark:bg-emergency-900/20 text-emergency-600 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
                Emergency System
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                3 Seconds Mein Help Activate
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Kisi bhi emergency mein turant madad. SOS activate hote hi sab kuch automatic ho jata hai.
              </p>

              <div className="space-y-4">
                {[
                  'Power button 3-4 baar press karein',
                  'Live location instantly share hogi',
                  'Audio/Video recording auto-start',
                  'Trusted contacts ko alert jayega',
                  'Nearby app users ko notification',
                  'Safe cloud backup - tamper proof',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emergency-100 dark:bg-emergency-900/30 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-emergency-600" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-emergency-100 dark:bg-emergency-900/20 flex items-center justify-center sos-active">
                  <div className="w-48 h-48 rounded-full bg-emergency-200 dark:bg-emergency-800/30 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-emergency-500 flex items-center justify-center shadow-2xl shadow-emergency-500/50 cursor-pointer hover:scale-105 transition">
                      <span className="text-white text-3xl font-bold">SOS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Section */}
      <section id="consultation" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Expert Consultation</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            Verified experts se confidential baat karein. Per minute charges - sirf utna pay karein jitna use karein.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MessageCircle, title: 'Chat', desc: 'Text-based consultation. Private & encrypted.', rate: '₹5-15/min' },
              { icon: Phone, title: 'Voice Call', desc: 'Direct voice consultation with experts.', rate: '₹10-25/min' },
              { icon: Clock, title: 'Scheduled', desc: 'Book appointment at your convenience.', rate: 'Expert rate' },
            ].map((mode) => (
              <div key={mode.title} className="card text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
                  <mode.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{mode.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{mode.desc}</p>
                <div className="text-primary-600 font-semibold">{mode.rate}</div>
              </div>
            ))}
          </div>

          {/* Wallet Recharge */}
          <div className="mt-16">
            <h3 className="text-xl font-semibold mb-6">Quick Recharge</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[99, 199, 499, 999, 1999, 4999].map((amount) => (
                <button key={amount} className="px-6 py-3 rounded-xl border-2 border-primary-200 dark:border-primary-800 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition font-semibold">
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trust & Security</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            Aapki privacy humari top priority hai. Military-grade encryption aur strict data policies.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'End-to-End Encrypted' },
              { icon: Star, title: 'Verified Experts' },
              { icon: Users, title: 'Anonymous Option' },
              { icon: Heart, title: 'No Data Sharing' },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-primary-50 dark:bg-primary-900/10">
                <item.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <p className="font-medium">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="download" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card bg-gradient-to-r from-primary-600 to-primary-800 border-none text-white p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Download SecureConnect India</h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">
              Abhi download karein aur apni safety ko ek naya level dein. Emergency SOS bilkul free hai.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-white text-primary-700 font-semibold py-3 px-8 rounded-xl hover:bg-gray-100 transition w-full sm:w-auto">
                Google Play Store
              </button>
              <button className="bg-white/20 text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/30 transition border border-white/30 w-full sm:w-auto">
                Apple App Store
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
                <span className="font-bold text-lg">SecureConnect</span>
              </div>
              <p className="text-sm text-gray-500">
                India&apos;s trusted safety & consultation platform. Your safety, our priority.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>Emergency SOS</li>
                <li>Personal Consultation</li>
                <li>Mental Wellness</li>
                <li>Women&apos;s Health</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>Help Center</li>
                <li>Emergency: 112</li>
                <li>Women Helpline: 1091</li>
                <li>support@secureconnect.in</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 SecureConnect India. All rights reserved. Made with ❤️ in India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
