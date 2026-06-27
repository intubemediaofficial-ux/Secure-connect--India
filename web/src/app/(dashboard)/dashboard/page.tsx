'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, MessageCircle, Heart, Users, Wallet, Bell, Settings, Phone, MapPin, Clock, Star, ChevronRight, Menu, X, LogOut, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: Shield, label: 'Dashboard', href: '/dashboard', active: true },
    { icon: AlertTriangle, label: 'Emergency', href: '/emergency', badge: 'SOS' },
    { icon: MessageCircle, label: 'Consultation', href: '/consultation' },
    { icon: Heart, label: 'Mental Wellness', href: '/consultation?category=MENTAL_WELLNESS' },
    { icon: Users, label: "Women's Health", href: '/consultation?category=WOMENS_HEALTH' },
    { icon: Wallet, label: 'Wallet', href: '/wallet' },
    { icon: Star, label: 'Favorites', href: '/favorites' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 p-6 border-b border-gray-100 dark:border-gray-800">
          <Shield className="w-8 h-8 text-primary-600" />
          <span className="text-xl font-bold">SecureConnect</span>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                item.active
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-emergency-100 text-emergency-600 px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-800">
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-emergency-600 transition w-full">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back! Stay safe.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emergency-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* SOS Button */}
          <div className="card bg-gradient-to-r from-emergency-500 to-emergency-600 border-none text-white p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Emergency SOS</h2>
            <p className="text-emergency-100 mb-6">Tap the button below in case of emergency</p>
            <Link href="/emergency" className="inline-block">
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mx-auto cursor-pointer hover:scale-105 transition sos-active">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl">
                  <span className="text-emergency-600 text-2xl font-bold">SOS</span>
                </div>
              </div>
            </Link>
            <p className="text-sm text-emergency-100 mt-4">Or press power button 3 times</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Phone, label: 'Call Expert', href: '/consultation', color: 'primary' },
              { icon: MessageCircle, label: 'Chat', href: '/consultation?mode=CHAT', color: 'primary' },
              { icon: MapPin, label: 'Share Location', href: '/emergency', color: 'emergency' },
              { icon: Wallet, label: 'Recharge', href: '/wallet', color: 'success' },
            ].map((action) => (
              <Link key={action.label} href={action.href} className="card text-center hover:shadow-lg transition p-4">
                <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                  action.color === 'emergency' ? 'bg-emergency-50 dark:bg-emergency-900/20' :
                  action.color === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                  'bg-primary-50 dark:bg-primary-900/20'
                }`}>
                  <action.icon className={`w-6 h-6 ${
                    action.color === 'emergency' ? 'text-emergency-600' :
                    action.color === 'success' ? 'text-green-600' :
                    'text-primary-600'
                  }`} />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>

          {/* Safety Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Safety Status</h3>
              <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Safe
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-2xl font-bold text-primary-600">3</div>
                <div className="text-xs text-gray-500">Emergency Contacts</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-xs text-gray-500">Active Alerts</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-2xl font-bold text-primary-600">2</div>
                <div className="text-xs text-gray-500">Trusted Places</div>
              </div>
            </div>
          </div>

          {/* Expert Categories */}
          <div>
            <h3 className="font-semibold mb-4">Consult Experts</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: 'Relationship', emoji: '💕', category: 'RELATIONSHIP' },
                { label: 'Marriage', emoji: '💍', category: 'MARRIAGE' },
                { label: 'Family', emoji: '👨‍👩‍👧', category: 'FAMILY' },
                { label: 'Breakup', emoji: '💔', category: 'BREAKUP' },
                { label: 'Stress', emoji: '😰', category: 'STRESS' },
                { label: 'Anxiety', emoji: '🧠', category: 'ANXIETY' },
                { label: "Women's Health", emoji: '🩺', category: 'WOMENS_HEALTH' },
                { label: 'Loneliness', emoji: '😔', category: 'LONELINESS' },
              ].map((cat) => (
                <Link
                  key={cat.category}
                  href={`/consultation?category=${cat.category}`}
                  className="card p-4 text-center hover:shadow-lg hover:border-primary-200 transition"
                >
                  <div className="text-3xl mb-2">{cat.emoji}</div>
                  <div className="text-sm font-medium">{cat.label}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Quick View */}
          <div className="card bg-gradient-to-r from-primary-600 to-primary-700 border-none text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Wallet Balance</p>
                <p className="text-3xl font-bold">₹0.00</p>
              </div>
              <Link href="/wallet" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition">
                Recharge
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
