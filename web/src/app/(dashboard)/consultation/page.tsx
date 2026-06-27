'use client';

import { useState } from 'react';
import { Search, Star, Clock, MessageCircle, Phone, Video, Filter, ChevronRight, Globe } from 'lucide-react';
import Link from 'next/link';

export default function ConsultationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'RELATIONSHIP', label: 'Relationship' },
    { id: 'MARRIAGE', label: 'Marriage' },
    { id: 'FAMILY', label: 'Family' },
    { id: 'BREAKUP', label: 'Breakup' },
    { id: 'PSYCHOLOGY', label: 'Psychology' },
    { id: 'MENTAL_WELLNESS', label: 'Mental Health' },
    { id: 'WOMENS_HEALTH', label: "Women's Health" },
    { id: 'STRESS', label: 'Stress' },
  ];

  const experts = [
    {
      id: '1', name: 'Dr. Anjali Sharma', avatar: null,
      qualification: 'M.A. Psychology, PhD', specialization: ['Relationship', 'Marriage'],
      experience: 8, rating: 4.8, totalRatings: 245, totalConsultations: 1200,
      perMinuteRate: 12, isOnline: true, languages: ['Hindi', 'English'],
      category: 'RELATIONSHIP',
    },
    {
      id: '2', name: 'Dr. Priya Verma', avatar: null,
      qualification: 'MBBS, MS (OB-GYN)', specialization: ["Women's Health", 'PCOS'],
      experience: 12, rating: 4.9, totalRatings: 380, totalConsultations: 2100,
      perMinuteRate: 18, isOnline: true, languages: ['Hindi', 'English', 'Punjabi'],
      category: 'WOMENS_HEALTH',
    },
    {
      id: '3', name: 'Counselor Rahul Mehta', avatar: null,
      qualification: 'M.Sc. Clinical Psychology', specialization: ['Stress', 'Anxiety', 'Depression'],
      experience: 5, rating: 4.7, totalRatings: 156, totalConsultations: 800,
      perMinuteRate: 10, isOnline: false, languages: ['Hindi', 'English'],
      category: 'MENTAL_WELLNESS',
    },
    {
      id: '4', name: 'Dr. Neha Gupta', avatar: null,
      qualification: 'M.Phil. Psychology', specialization: ['Family', 'Marriage Counseling'],
      experience: 10, rating: 4.6, totalRatings: 298, totalConsultations: 1500,
      perMinuteRate: 15, isOnline: true, languages: ['Hindi', 'English', 'Marathi'],
      category: 'FAMILY',
    },
  ];

  const filteredExperts = experts.filter(e => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.name.toLowerCase().includes(q) || e.specialization.some(s => s.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6 lg:ml-72">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Expert Consultation</h1>
          <p className="text-gray-500">Connect with verified experts for confidential support</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experts by name or specialization..."
            className="input-field pl-12"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Consultation Mode */}
        <div className="flex gap-3">
          {[
            { id: 'CHAT', icon: MessageCircle, label: 'Chat' },
            { id: 'VOICE_CALL', icon: Phone, label: 'Voice Call' },
            { id: 'VIDEO_CALL', icon: Video, label: 'Video Call' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(selectedMode === mode.id ? null : mode.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedMode === mode.id
                  ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 border border-primary-300'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Expert List */}
        <div className="space-y-4">
          {filteredExperts.map((expert) => (
            <div key={expert.id} className="card hover:shadow-lg transition">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Avatar */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary-600">{expert.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{expert.name}</h3>
                      {expert.isOnline && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Online
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{expert.qualification}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {expert.specialization.map((s) => (
                        <span key={s} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats & Action */}
                <div className="flex items-center gap-6 md:flex-col md:items-end">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {expert.rating} ({expert.totalRatings})
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" /> {expert.experience} yrs
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Globe className="w-4 h-4" /> {expert.languages.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary-600">₹{expert.perMinuteRate}/min</span>
                    <button
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition ${
                        expert.isOnline
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!expert.isOnline}
                    >
                      {expert.isOnline ? 'Connect' : 'Offline'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExperts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No experts found matching your criteria</p>
            <p className="text-sm mt-2">Try changing filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
