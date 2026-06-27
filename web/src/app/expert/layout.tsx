'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield, LayoutDashboard, User, Calendar, MessageSquare,
  IndianRupee, Star, LogOut, Menu, X, Wifi, WifiOff, Sparkles
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const navItems = [
  { href: '/expert/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expert/profile', label: 'Profile', icon: User },
  { href: '/expert/availability', label: 'Availability', icon: Calendar },
  { href: '/expert/consultations', label: 'Consultations', icon: MessageSquare },
  { href: '/expert/earnings', label: 'Earnings', icon: IndianRupee },
  { href: '/expert/ratings', label: 'Ratings', icon: Star },
];

export default function ExpertLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expert, setExpert] = useState<{ name?: string; category?: string; isOnline?: boolean } | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('expertToken');
    if (!token) {
      router.push('/expert-login');
      return;
    }
    const stored = localStorage.getItem('expert');
    if (stored) {
      const data = JSON.parse(stored);
      setExpert(data);
      setIsOnline(data.isOnline || false);
    }
  }, [router]);

  const handleToggleOnline = async () => {
    setToggling(true);
    try {
      const token = localStorage.getItem('expertToken');
      const endpoint = isOnline ? '/api/experts/go-offline' : '/api/experts/go-online';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setIsOnline(!isOnline);
        const stored = localStorage.getItem('expert');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.isOnline = !isOnline;
          localStorage.setItem('expert', JSON.stringify(parsed));
        }
      }
    } catch { /* ignore */ } finally {
      setToggling(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('expertToken');
    localStorage.removeItem('expert');
    router.push('/expert-login');
  };

  return (
    <div className="page-bg flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 glass-sidebar transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 p-6 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">SecureConnect</h1>
            <p className="text-xs text-gray-500">Expert Portal</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Online/Offline Toggle */}
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <button
            onClick={handleToggleOnline}
            disabled={toggling}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                : 'bg-white/[0.05] text-gray-500 border border-white/[0.08]'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {toggling ? 'Switching...' : isOnline ? 'Online' : 'Offline'}
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'nav-item-inactive'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center relative shadow-lg shadow-emerald-500/20">
              <span className="text-sm font-bold text-white">{expert?.name?.[0] || 'E'}</span>
              {isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900 animate-pulse" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{expert?.name || 'Expert'}</p>
              <p className="text-xs text-gray-500 truncate">{expert?.category?.replace('_', ' ') || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-emergency-400 transition w-full px-2 py-1.5 rounded-lg hover:bg-emergency-500/10">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 glass-header px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400">
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-white flex-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            {navItems.find(i => i.href === pathname)?.label || 'Expert'}
          </h2>
          <div className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${
            isOnline
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-gray-500 bg-white/[0.03] border-white/[0.08]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
