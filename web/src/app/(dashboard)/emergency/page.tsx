'use client';

import { useState } from 'react';
import { AlertTriangle, MapPin, Mic, Camera, Video, Phone, Users, Shield, Clock, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function EmergencyPage() {
  const [sosActive, setSosActive] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  const emergencyContacts = [
    { id: '1', name: 'Maa', phone: '9876543210', relationship: 'Mother', isPrimary: true },
    { id: '2', name: 'Papa', phone: '9876543211', relationship: 'Father', isPrimary: false },
    { id: '3', name: 'Bhai', phone: '9876543212', relationship: 'Brother', isPrimary: false },
  ];

  const handleSOSActivate = () => {
    setSosActive(true);
    // In production: Call API + start location tracking + audio recording
  };

  const handleSOSDeactivate = () => {
    setSosActive(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6 lg:ml-72">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Emergency Safety</h1>
            <p className="text-gray-500">Your safety features and SOS system</p>
          </div>
          <Link href="/dashboard" className="text-primary-600 hover:underline text-sm">
            Back to Dashboard
          </Link>
        </div>

        {/* SOS Button Section */}
        <div className={`card text-center py-12 ${sosActive ? 'bg-emergency-50 dark:bg-emergency-900/10 border-emergency-200' : ''}`}>
          {!sosActive ? (
            <>
              <h2 className="text-xl font-bold mb-4">Emergency SOS</h2>
              <p className="text-gray-500 mb-8">Tap and hold for 3 seconds to activate emergency alert</p>
              <button
                onClick={handleSOSActivate}
                className="w-40 h-40 rounded-full bg-emergency-500 hover:bg-emergency-600 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emergency-500/40 transition hover:scale-105 active:scale-95"
              >
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                  <span className="text-xl font-bold">SOS</span>
                </div>
              </button>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Mic className="w-4 h-4" /> Auto Record</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Live Location</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Alert Contacts</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-40 h-40 rounded-full bg-emergency-500 flex items-center justify-center mx-auto sos-active mb-6">
                <div className="text-center text-white">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-1 animate-bounce" />
                  <span className="text-lg font-bold">ACTIVE</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-emergency-600 mb-2">SOS ALERT ACTIVE</h2>
              <p className="text-gray-600 mb-4">Your emergency contacts have been notified</p>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                  <Mic className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <span className="text-xs text-green-600 font-medium">Recording</span>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                  <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <span className="text-xs text-blue-600 font-medium">Tracking</span>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                  <Users className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <span className="text-xs text-purple-600 font-medium">3 Alerted</span>
                </div>
              </div>

              <button
                onClick={handleSOSDeactivate}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-medium hover:bg-gray-300 transition"
              >
                Deactivate SOS (I am safe)
              </button>
            </>
          )}
        </div>

        {/* Quick Safety Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="card p-4 text-center hover:shadow-lg transition">
            <Phone className="w-8 h-8 text-emergency-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Fake Call</span>
          </button>
          <button className="card p-4 text-center hover:shadow-lg transition">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Share Location</span>
          </button>
          <button className="card p-4 text-center hover:shadow-lg transition">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Safety Timer</span>
          </button>
          <button className="card p-4 text-center hover:shadow-lg transition">
            <Camera className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium">Quick Photo</span>
          </button>
        </div>

        {/* Emergency Contacts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Emergency Contacts</h3>
            <button
              onClick={() => setShowAddContact(true)}
              className="flex items-center gap-1 text-primary-600 text-sm font-medium hover:underline"
            >
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          </div>

          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">{contact.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {contact.name}
                      {contact.isPrimary && (
                        <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">Primary</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{contact.phone} • {contact.relationship}</div>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-emergency-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Safety Tips</h3>
          <div className="space-y-3">
            {[
              'Hamesha apne trusted contacts ko update rakhein',
              'SOS feature ko test karein - ye free hai',
              'Raat ko alone travel karte waqt safety timer use karein',
              'Apni live location trusted contacts ke saath share karein',
              'Emergency number 112 yaad rakhein',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-primary-50/50 dark:bg-primary-900/10 rounded-xl">
                <Shield className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
