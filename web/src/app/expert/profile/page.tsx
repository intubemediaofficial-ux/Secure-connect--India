'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, User, Mail, Phone, FileText, IndianRupee, Building2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface ExpertProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string | null;
  qualification: string;
  category: string;
  specialization: string[];
  experience: number;
  perMinuteRate: number;
  languages: string[];
  gender: string;
  bankAccount: string | null;
  ifscCode: string | null;
  upiId: string | null;
}

export default function ExpertProfilePage() {
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '', bio: '', perMinuteRate: '', bankAccount: '', ifscCode: '', upiId: '',
    specialization: '' as string,
    languages: '' as string,
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
        setForm({
          name: data.data.name || '',
          bio: data.data.bio || '',
          perMinuteRate: String(data.data.perMinuteRate || ''),
          bankAccount: data.data.bankAccount || '',
          ifscCode: data.data.ifscCode || '',
          upiId: data.data.upiId || '',
          specialization: (data.data.specialization || []).join(', '),
          languages: (data.data.languages || []).join(', '),
        });
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          perMinuteRate: form.perMinuteRate,
          specialization: form.specialization.split(',').map(s => s.trim()).filter(Boolean),
          languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
          bankAccount: form.bankAccount || undefined,
          ifscCode: form.ifscCode || undefined,
          upiId: form.upiId || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        const stored = localStorage.getItem('expert');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.name = form.name;
          localStorage.setItem('expert', JSON.stringify(parsed));
        }
      }
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {saved && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 text-sm text-center">
          Profile updated successfully!
        </div>
      )}

      {/* Basic Info (Read-only) */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-500" />
          Basic Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" /> {profile?.email}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Phone</label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4" /> {profile?.phone}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400">
              {profile?.category?.replace('_', ' ')}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Qualification</label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4" /> {profile?.qualification}
            </div>
          </div>
        </div>
      </div>

      {/* Editable Info */}
      <div className="card">
        <h3 className="font-semibold mb-4">Edit Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="input-field resize-none"
              placeholder="Tell users about your expertise..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rate (₹/min)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min={1}
                  value={form.perMinuteRate}
                  onChange={(e) => setForm(f => ({ ...f, perMinuteRate: e.target.value }))}
                  className="input-field pl-9"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience: {profile?.experience} yrs</label>
              <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-500">
                {profile?.experience} years
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Specialization (comma separated)</label>
            <input
              value={form.specialization}
              onChange={(e) => setForm(f => ({ ...f, specialization: e.target.value }))}
              className="input-field"
              placeholder="Relationship Counseling, CBT, Stress Management"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Languages (comma separated)</label>
            <input
              value={form.languages}
              onChange={(e) => setForm(f => ({ ...f, languages: e.target.value }))}
              className="input-field"
              placeholder="hi, en, ur"
            />
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-500" />
          Payment Details (for withdrawals)
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">UPI ID</label>
            <input
              value={form.upiId}
              onChange={(e) => setForm(f => ({ ...f, upiId: e.target.value }))}
              className="input-field"
              placeholder="expert@upi"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bank Account Number</label>
              <input
                value={form.bankAccount}
                onChange={(e) => setForm(f => ({ ...f, bankAccount: e.target.value }))}
                className="input-field"
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IFSC Code</label>
              <input
                value={form.ifscCode}
                onChange={(e) => setForm(f => ({ ...f, ifscCode: e.target.value }))}
                className="input-field"
                placeholder="SBIN0001234"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}
