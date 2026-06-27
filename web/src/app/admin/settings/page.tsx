'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Shield, IndianRupee, Clock, MapPin, Users } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface AppSettings {
  platformFeePercent: number;
  sosNearbyRadiusKm: number;
  otpExpiryMinutes: number;
  maxEmergencyContacts: number;
  minWithdrawalAmount: number;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  allowAnonymousConsultation: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    platformFeePercent: 20,
    sosNearbyRadiusKm: 5,
    otpExpiryMinutes: 5,
    maxEmergencyContacts: 5,
    minWithdrawalAmount: 500,
    maintenanceMode: false,
    allowNewRegistrations: true,
    allowAnonymousConsultation: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch { /* use defaults */ } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      for (const [key, value] of Object.entries(settings)) {
        await fetch(`${API_BASE}/api/admin/settings`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: String(value) }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {saved && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 text-sm text-center">
          Settings saved successfully!
        </div>
      )}

      {/* Platform Fee */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <IndianRupee className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold">Platform Fee</h3>
            <p className="text-sm text-gray-500">Percentage deducted from each consultation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={50}
            value={settings.platformFeePercent}
            onChange={(e) => setSettings(s => ({ ...s, platformFeePercent: Number(e.target.value) }))}
            className="input-field w-32"
          />
          <span className="text-gray-500">%</span>
          <span className="text-sm text-gray-400">(Expert gets {100 - settings.platformFeePercent}%)</span>
        </div>
      </div>

      {/* SOS Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <MapPin className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold">SOS Settings</h3>
            <p className="text-sm text-gray-500">Emergency system configuration</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nearby Alert Radius (km)</label>
            <input
              type="number"
              min={1}
              max={50}
              value={settings.sosNearbyRadiusKm}
              onChange={(e) => setSettings(s => ({ ...s, sosNearbyRadiusKm: Number(e.target.value) }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Emergency Contacts</label>
            <input
              type="number"
              min={1}
              max={10}
              value={settings.maxEmergencyContacts}
              onChange={(e) => setSettings(s => ({ ...s, maxEmergencyContacts: Number(e.target.value) }))}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Auth Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">Authentication</h3>
            <p className="text-sm text-gray-500">OTP and login settings</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">OTP Expiry (minutes)</label>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.otpExpiryMinutes}
              onChange={(e) => setSettings(s => ({ ...s, otpExpiryMinutes: Number(e.target.value) }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min Withdrawal Amount (₹)</label>
            <input
              type="number"
              min={100}
              value={settings.minWithdrawalAmount}
              onChange={(e) => setSettings(s => ({ ...s, minWithdrawalAmount: Number(e.target.value) }))}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Toggle Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">Platform Controls</h3>
            <p className="text-sm text-gray-500">Enable or disable platform features</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { key: 'maintenanceMode' as const, label: 'Maintenance Mode', desc: 'Disable the platform temporarily for maintenance', danger: true },
            { key: 'allowNewRegistrations' as const, label: 'Allow New Registrations', desc: 'Allow new users to sign up', danger: false },
            { key: 'allowAnonymousConsultation' as const, label: 'Anonymous Consultation', desc: 'Allow users to consult anonymously', danger: false },
          ].map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="font-medium text-sm">{toggle.label}</p>
                <p className="text-xs text-gray-500">{toggle.desc}</p>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, [toggle.key]: !s[toggle.key] }))}
                className={`relative w-12 h-6 rounded-full transition ${
                  settings[toggle.key]
                    ? toggle.danger ? 'bg-red-500' : 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings[toggle.key] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary flex items-center gap-2"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
