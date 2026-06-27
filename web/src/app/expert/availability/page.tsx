'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Clock } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DaySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function ExpertAvailabilityPage() {
  const [slots, setSlots] = useState<DaySlot[]>(
    DAYS.map((_, i) => ({ dayOfWeek: i + 1, startTime: '09:00', endTime: '18:00', isActive: false }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchAvailability(); }, []);

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setSlots(prev => prev.map(s => {
          const match = data.data.find((d: DaySlot) => d.dayOfWeek === s.dayOfWeek);
          return match ? { ...s, startTime: match.startTime, endTime: match.endTime, isActive: match.isActive } : s;
        }));
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/availability`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: slots.filter(s => s.isActive) }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  const toggleDay = (index: number) => {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, isActive: !s.isActive } : s));
  };

  const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
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
          Availability saved!
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold">Weekly Schedule</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Set your available days and timings. Users will only see you online during these hours.
        </p>

        <div className="space-y-3">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className={`flex items-center gap-4 p-4 rounded-xl border transition ${
                slots[index].isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Toggle */}
              <button
                onClick={() => toggleDay(index)}
                className={`relative w-12 h-6 rounded-full transition flex-shrink-0 ${
                  slots[index].isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  slots[index].isActive ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>

              {/* Day name */}
              <span className={`w-24 text-sm font-medium ${slots[index].isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'}`}>
                {day}
              </span>

              {/* Time inputs */}
              {slots[index].isActive ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={slots[index].startTime}
                    onChange={(e) => updateTime(index, 'startTime', e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="time"
                    value={slots[index].endTime}
                    onChange={(e) => updateTime(index, 'endTime', e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400 flex-1">Not available</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {saving ? 'Saving...' : 'Save Schedule'}
      </button>
    </div>
  );
}
