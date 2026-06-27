'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Calendar, Clock, CheckCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Slot { day: string; isActive: boolean; startTime: string; endTime: string; }

export default function ExpertAvailabilityPage() {
  const [slots, setSlots] = useState<Slot[]>(DAYS.map(d => ({ day: d, isActive: false, startTime: '09:00', endTime: '17:00' })));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token = localStorage.getItem('expertToken');
        const res = await fetch(`${API_BASE}/api/experts/availability`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setSlots(prev => prev.map(s => {
            const found = data.data.find((a: Slot) => a.day === s.day);
            return found ? { ...s, ...found, isActive: true } : s;
          }));
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchAvailability();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('expertToken');
      await fetch(`${API_BASE}/api/experts/availability`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: slots.filter(s => s.isActive) }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const toggleDay = (day: string) => setSlots(prev => prev.map(s => s.day === day ? { ...s, isActive: !s.isActive } : s));
  const updateTime = (day: string, field: 'startTime' | 'endTime', value: string) => setSlots(prev => prev.map(s => s.day === day ? { ...s, [field]: value } : s));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" /> Availability saved successfully!
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          Weekly Schedule
        </h3>
        <p className="text-gray-500 text-sm mb-6">Set your available days and hours for consultations</p>

        <div className="space-y-3">
          {slots.map(slot => (
            <div key={slot.day} className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
              slot.isActive
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-white/[0.02] border-white/[0.06]'
            }`}>
              <button
                onClick={() => toggleDay(slot.day)}
                className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                  slot.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-gray-700'
                }`}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-300 ${
                  slot.isActive ? 'left-7' : 'left-0.5'
                }`} />
              </button>
              <span className={`w-24 font-medium text-sm ${slot.isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                {slot.day}
              </span>
              {slot.isActive && (
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <input type="time" value={slot.startTime} onChange={e => updateTime(slot.day, 'startTime', e.target.value)}
                      className="bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/50" />
                  </div>
                  <span className="text-gray-600">to</span>
                  <input type="time" value={slot.endTime} onChange={e => updateTime(slot.day, 'endTime', e.target.value)}
                    className="bg-white/[0.06] border border-white/[0.12] rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/50" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50">
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {saving ? 'Saving...' : 'Save Schedule'}
      </button>
    </div>
  );
}
