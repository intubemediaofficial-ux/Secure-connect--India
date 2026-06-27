'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, User, Briefcase, Phone, Mail, CreditCard, CheckCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function ExpertProfilePage() {
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', bio: '', perMinuteRate: 0,
    specialization: '', languages: '', qualification: '', category: '',
    gender: '', experience: 0, upiId: '', bankAccount: '', ifscCode: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('expertToken');
        const res = await fetch(`${API_BASE}/api/experts/profile`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          const p = data.data;
          setProfile({
            name: p.name || '', email: p.email || '', phone: p.phone || '',
            bio: p.bio || '', perMinuteRate: p.perMinuteRate || 0,
            specialization: p.specialization || '', languages: p.languages?.join(', ') || '',
            qualification: p.qualification || '', category: p.category || '',
            gender: p.gender || '', experience: p.experience || 0,
            upiId: p.paymentDetails?.upiId || '', bankAccount: p.paymentDetails?.bankAccount || '',
            ifscCode: p.paymentDetails?.ifscCode || '',
          });
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('expertToken');
      await fetch(`${API_BASE}/api/experts/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name, bio: profile.bio, perMinuteRate: Number(profile.perMinuteRate),
          specialization: profile.specialization,
          languages: profile.languages.split(',').map(l => l.trim()).filter(Boolean),
          paymentDetails: { upiId: profile.upiId, bankAccount: profile.bankAccount, ifscCode: profile.ifscCode },
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" /> Profile saved successfully!
        </div>
      )}

      {/* Read-only Info */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-400" />
          Account Info
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Email', value: profile.email, icon: Mail },
            { label: 'Phone', value: profile.phone, icon: Phone },
            { label: 'Category', value: profile.category?.replace('_', ' '), icon: Briefcase },
            { label: 'Qualification', value: profile.qualification, icon: Briefcase },
          ].map(f => (
            <div key={f.label} className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <p className="text-xs text-gray-500 mb-1">{f.label}</p>
              <p className="text-gray-200 font-medium">{f.value || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editable */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-400" />
          Professional Details
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
            <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Bio</label>
            <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="input-field h-24 resize-none" placeholder="Tell users about yourself..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Rate (₹/min)</label>
              <input type="number" value={profile.perMinuteRate} onChange={e => setProfile({...profile, perMinuteRate: Number(e.target.value)})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Specialization</label>
              <input value={profile.specialization} onChange={e => setProfile({...profile, specialization: e.target.value})} className="input-field" placeholder="e.g. CBT, Couples Therapy" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Languages (comma separated)</label>
            <input value={profile.languages} onChange={e => setProfile({...profile, languages: e.target.value})} className="input-field" placeholder="Hindi, English, Urdu" />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-400" />
          Payment Details
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">UPI ID</label>
            <input value={profile.upiId} onChange={e => setProfile({...profile, upiId: e.target.value})} className="input-field" placeholder="yourname@upi" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Bank Account</label>
              <input value={profile.bankAccount} onChange={e => setProfile({...profile, bankAccount: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">IFSC Code</label>
              <input value={profile.ifscCode} onChange={e => setProfile({...profile, ifscCode: e.target.value})} className="input-field" />
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50">
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}
