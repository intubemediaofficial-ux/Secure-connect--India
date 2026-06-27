'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, MessageCircle, Heart, Users, Wallet, Bell, Settings, Phone, MapPin, Clock, Star, ChevronRight, Menu, X, LogOut, User, Sparkles, Zap } from 'lucide-react';
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

  const categories = [
    { label: 'Relationship', emoji: '💕', category: 'RELATIONSHIP', gradient: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/20 hover:border-pink-400/40', text: 'text-pink-400' },
    { label: 'Marriage', emoji: '💍', category: 'MARRIAGE', gradient: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/20 hover:border-amber-400/40', text: 'text-amber-400' },
    { label: 'Family', emoji: '👨‍👩‍👧', category: 'FAMILY', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20 hover:border-blue-400/40', text: 'text-blue-400' },
    { label: 'Breakup', emoji: '💔', category: 'BREAKUP', gradient: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/20 hover:border-red-400/40', text: 'text-red-400' },
    { label: 'Stress', emoji: '😰', category: 'STRESS', gradient: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/20 hover:border-purple-400/40', text: 'text-purple-400' },
    { label: 'Anxiety', emoji: '🧠', category: 'ANXIETY', gradient: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/20 hover:border-indigo-400/40', text: 'text-indigo-400' },
    { label: "Women's Health", emoji: '🩺', category: 'WOMENS_HEALTH', gradient: 'from-teal-500/20 to-emerald-500/20', border: 'border-teal-500/20 hover:border-teal-400/40', text: 'text-teal-400' },
    { label: 'Loneliness', emoji: '😔', category: 'LONELINESS', gradient: 'from-slate-500/20 to-gray-500/20', border: 'border-slate-500/20 hover:border-slate-400/40', text: 'text-slate-400' },
  ];

  return (
    <div className="page-bg">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass-sidebar transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 p-6 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold gradient-text">SecureConnect</span>
            <p className="text-xs text-gray-500">Your Safety, Our Priority</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-item ${item.active ? 'nav-item-active' : 'nav-item-inactive'}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-emergency-500/20 text-emergency-400 px-2 py-0.5 rounded-full font-bold border border-emergency-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06]">
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-emergency-400 transition w-full rounded-xl hover:bg-emergency-500/10">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-header">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-6 h-6 text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back! Stay safe.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition border border-white/[0.08]">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emergency-500 rounded-full animate-pulse"></span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* SOS Button - Premium Gradient */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emergency-600 via-emergency-500 to-rose-500 p-8 text-center shadow-2xl shadow-emergency-500/20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tOCA2djJoLTJ2LTJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-white/80" />
                <h2 className="text-2xl font-bold text-white">Emergency SOS</h2>
              </div>
              <p className="text-white/70 mb-6">Tap the button below in case of emergency</p>
              <Link href="/emergency" className="inline-block">
                <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mx-auto cursor-pointer hover:scale-110 transition-transform duration-300 sos-active">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl">
                    <span className="text-emergency-600 text-2xl font-black">SOS</span>
                  </div>
                </div>
              </Link>
              <p className="text-sm text-white/50 mt-4">Or press power button 3 times</p>
            </div>
          </div>

          {/* Quick Actions - Gradient Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Phone, label: 'Call Expert', href: '/consultation', gradient: 'from-blue-600 to-blue-800', shadow: 'shadow-blue-500/20', iconBg: 'bg-blue-400/20' },
              { icon: MessageCircle, label: 'Chat', href: '/consultation?mode=CHAT', gradient: 'from-purple-600 to-purple-800', shadow: 'shadow-purple-500/20', iconBg: 'bg-purple-400/20' },
              { icon: MapPin, label: 'Share Location', href: '/emergency', gradient: 'from-emergency-600 to-emergency-800', shadow: 'shadow-emergency-500/20', iconBg: 'bg-emergency-400/20' },
              { icon: Wallet, label: 'Recharge', href: '/wallet', gradient: 'from-emerald-600 to-emerald-800', shadow: 'shadow-emerald-500/20', iconBg: 'bg-emerald-400/20' },
            ].map((action) => (
              <Link key={action.label} href={action.href} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.gradient} p-5 text-center hover:scale-[1.03] transition-all duration-300 shadow-xl ${action.shadow} border border-white/[0.1]`}>
                <div className={`w-14 h-14 rounded-xl ${action.iconBg} mx-auto mb-3 flex items-center justify-center`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">{action.label}</span>
              </Link>
            ))}
          </div>

          {/* Safety Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-400" />
                Safety Status
              </h3>
              <span className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                Safe
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card bg-gradient-to-br from-primary-500/10 to-primary-600/5 text-center">
                <div className="text-3xl font-bold text-primary-400">3</div>
                <div className="text-xs text-gray-400 mt-1">Emergency Contacts</div>
              </div>
              <div className="stat-card bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 text-center">
                <div className="text-3xl font-bold text-emerald-400">0</div>
                <div className="text-xs text-gray-400 mt-1">Active Alerts</div>
              </div>
              <div className="stat-card bg-gradient-to-br from-purple-500/10 to-purple-600/5 text-center">
                <div className="text-3xl font-bold text-purple-400">2</div>
                <div className="text-xs text-gray-400 mt-1">Trusted Places</div>
              </div>
            </div>
          </div>

          {/* Expert Categories - Colorful Grid */}
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Consult Experts
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.category}
                  href={`/consultation?category=${cat.category}`}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradient} p-5 text-center hover:scale-[1.03] transition-all duration-300 border ${cat.border} backdrop-blur-sm`}
                >
                  <div className="text-4xl mb-3">{cat.emoji}</div>
                  <div className={`text-sm font-semibold ${cat.text}`}>{cat.label}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet - Premium Gradient */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 p-6 shadow-2xl shadow-primary-500/20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Wallet Balance
                </p>
                <p className="text-4xl font-bold text-white mt-1">₹0.00</p>
              </div>
              <Link href="/wallet" className="bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 text-white border border-white/20 hover:border-white/30">
                Recharge →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
