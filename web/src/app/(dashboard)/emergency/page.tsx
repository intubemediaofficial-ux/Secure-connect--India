'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, MapPin, Mic, Camera, Video, Phone, Users, Shield, Clock, Plus, X, Navigation, Bell, Eye, RadioTower, Waves, VideoIcon } from 'lucide-react';
import Link from 'next/link';
import { connectSocket, getSocket } from '@/lib/socket';

interface NearbyAlert {
  alertId: string;
  latitude: number;
  longitude: number;
  userId: string;
  userName?: string;
  distance?: number;
  createdAt?: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export default function EmergencyPage() {
  const [sosActive, setSosActive] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: 'Other' });
  const [nearbyAlerts, setNearbyAlerts] = useState<NearbyAlert[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sosTimer, setSosTimer] = useState(0);
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedCount, setCapturedCount] = useState(0);
  const [videoRecording, setVideoRecording] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const locationWatchRef = useRef<number>();
  const captureIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn('Location permission denied')
      );
    }
  }, []);

  // Load contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/sos/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setContacts(data.data);
      } catch {
        // Fallback demo contacts
        setContacts([
          { id: '1', name: 'Maa', phone: '9876543210', relationship: 'Mother', isPrimary: true },
          { id: '2', name: 'Papa', phone: '9876543211', relationship: 'Father', isPrimary: false },
          { id: '3', name: 'Bhai', phone: '9876543212', relationship: 'Brother', isPrimary: false },
        ]);
      }
    };
    fetchContacts();
  }, [API_URL]);

  // Connect socket for nearby alerts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    connectSocket(token);

    const socket = getSocket();
    if (!socket) return;

    const handleNewSOS = (data: NearbyAlert) => {
      if (!userLocation) return;
      const dist = haversineDistance(userLocation.lat, userLocation.lng, data.latitude, data.longitude);
      // Show alerts within 5km
      if (dist <= 5000) {
        setNearbyAlerts((prev) => {
          const exists = prev.some((a) => a.alertId === data.alertId);
          if (exists) return prev;
          return [{ ...data, distance: dist }, ...prev];
        });
      }
    };

    const handleSOSResolved = (data: { alertId: string }) => {
      setNearbyAlerts((prev) => prev.filter((a) => a.alertId !== data.alertId));
    };

    const handleSOSLocation = (data: { alertId: string; latitude: number; longitude: number }) => {
      if (!userLocation) return;
      const dist = haversineDistance(userLocation.lat, userLocation.lng, data.latitude, data.longitude);
      setNearbyAlerts((prev) =>
        prev.map((a) =>
          a.alertId === data.alertId ? { ...a, latitude: data.latitude, longitude: data.longitude, distance: dist } : a
        )
      );
    };

    socket.on('sos:new', handleNewSOS);
    socket.on('sos:resolved', handleSOSResolved);
    socket.on('sos:location', handleSOSLocation);

    // Fetch existing nearby alerts
    if (userLocation) {
      fetch(`${API_URL}/api/sos/nearby?latitude=${userLocation.lat}&longitude=${userLocation.lng}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            const alertsWithDist = data.data.map((a: { id: string; latitude: number; longitude: number; user?: { name?: string }; createdAt?: string }) => ({
              alertId: a.id,
              latitude: a.latitude,
              longitude: a.longitude,
              userName: a.user?.name,
              distance: haversineDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude),
              createdAt: a.createdAt,
            }));
            setNearbyAlerts(alertsWithDist);
          }
        })
        .catch(() => {});
    }

    return () => {
      socket.off('sos:new', handleNewSOS);
      socket.off('sos:resolved', handleSOSResolved);
      socket.off('sos:location', handleSOSLocation);
    };
  }, [userLocation, API_URL]);

  // SOS timer
  useEffect(() => {
    if (sosActive) {
      timerRef.current = setInterval(() => setSosTimer((p) => p + 1), 1000);
    } else {
      setSosTimer(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sosActive]);

  const startContinuousCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 },
        audio: true,
      });
      videoStreamRef.current = stream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      if (captureMode === 'photo') {
        // Continuous photo capture every 3 seconds
        setIsCapturing(true);
        captureIntervalRef.current = setInterval(() => {
          if (canvasRef.current && videoPreviewRef.current) {
            const canvas = canvasRef.current;
            const video = videoPreviewRef.current;
            canvas.width = video.videoWidth || 1280;
            canvas.height = video.videoHeight || 720;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              canvas.toBlob(async (blob) => {
                if (blob) {
                  setCapturedCount((p) => p + 1);
                  // Upload to backend
                  const token = localStorage.getItem('token');
                  const formData = new FormData();
                  formData.append('photo', blob, `sos-photo-${Date.now()}.jpg`);
                  if (activeAlertId) formData.append('alertId', activeAlertId);
                  try {
                    await fetch(`${API_URL}/api/sos/evidence/photo`, {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData,
                    });
                  } catch { /* will retry next interval */ }
                }
              }, 'image/jpeg', 0.7);
            }
          }
        }, 3000);
      } else {
        // Continuous video recording
        setVideoRecording(true);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
        mediaRecorderRef.current = recorder;
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          setCapturedCount((p) => p + 1);
          const token = localStorage.getItem('token');
          const formData = new FormData();
          formData.append('video', blob, `sos-video-${Date.now()}.webm`);
          if (activeAlertId) formData.append('alertId', activeAlertId);
          try {
            await fetch(`${API_URL}/api/sos/evidence/video`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });
          } catch { /* ignore */ }
        };

        recorder.start();
        // Auto-save every 30 seconds
        captureIntervalRef.current = setInterval(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
            setTimeout(() => {
              if (videoStreamRef.current && videoStreamRef.current.active) {
                const newRecorder = new MediaRecorder(videoStreamRef.current, { mimeType: 'video/webm;codecs=vp8,opus' });
                const newChunks: Blob[] = [];
                newRecorder.ondataavailable = (e) => { if (e.data.size > 0) newChunks.push(e.data); };
                newRecorder.onstop = async () => {
                  const newBlob = new Blob(newChunks, { type: 'video/webm' });
                  setCapturedCount((p) => p + 1);
                  const token = localStorage.getItem('token');
                  const fd = new FormData();
                  fd.append('video', newBlob, `sos-video-${Date.now()}.webm`);
                  try { await fetch(`${API_URL}/api/sos/evidence/video`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd }); } catch {}
                };
                newRecorder.start();
                mediaRecorderRef.current = newRecorder;
              }
            }, 500);
          }
        }, 30000);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }, [captureMode, activeAlertId, API_URL]);

  const stopContinuousCapture = useCallback(() => {
    if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
    }
    setIsCapturing(false);
    setVideoRecording(false);
  }, []);

  const handleSOSActivate = async () => {
    setSosActive(true);
    setCapturedCount(0);

    // Get location and call API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/api/sos/activate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ latitude, longitude, triggerMethod: 'BUTTON' }),
          });
          const data = await res.json();
          if (data.success) {
            setActiveAlertId(data.data.alert.id);
          }
        } catch { /* continue even if API fails */ }

        // Start continuous location tracking
        locationWatchRef.current = navigator.geolocation.watchPosition(
          async (p) => {
            const token = localStorage.getItem('token');
            setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
            try {
              await fetch(`${API_URL}/api/sos/location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  latitude: p.coords.latitude,
                  longitude: p.coords.longitude,
                  accuracy: p.coords.accuracy,
                  speed: p.coords.speed,
                  altitude: p.coords.altitude,
                }),
              });
            } catch {}
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      });
    }

    // Start continuous capture
    startContinuousCapture();
  };

  const handleSOSDeactivate = async () => {
    setSosActive(false);
    stopContinuousCapture();

    if (locationWatchRef.current) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
    }

    if (activeAlertId) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/api/sos/deactivate/${activeAlertId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reason: 'user_deactivated' }),
        });
      } catch {}
      setActiveAlertId(null);
    }
  };

  const handleRespondToAlert = async (alertId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/sos/respond/${alertId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          latitude: userLocation?.lat,
          longitude: userLocation?.lng,
        }),
      });
      setNearbyAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
    } catch {}
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/sos/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newContact),
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) => [...prev, data.data]);
      }
    } catch {
      setContacts((prev) => [...prev, { id: Date.now().toString(), ...newContact, isPrimary: false }]);
    }
    setNewContact({ name: '', phone: '', relationship: 'Other' });
    setShowAddContact(false);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/sos/contacts/${contactId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const getDistanceColor = (meters: number) => {
    if (meters <= 100) return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (meters <= 500) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  };

  return (
    <div className="min-h-screen page-bg p-4 md:p-6 lg:ml-72">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Emergency Safety</h1>
            <p className="text-gray-400">Your safety features and SOS system</p>
          </div>
          <Link href="/dashboard" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
            Back to Dashboard
          </Link>
        </div>

        {/* Nearby SOS Alerts Banner */}
        {nearbyAlerts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <RadioTower className="w-5 h-5 animate-pulse" />
              <h3 className="font-semibold text-lg">Nearby Emergency Alerts ({nearbyAlerts.length})</h3>
            </div>
            {nearbyAlerts.map((alert) => (
              <div
                key={alert.alertId}
                className="relative overflow-hidden rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl p-4"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full -translate-y-5 translate-x-5" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {alert.userName || 'Someone'} needs help!
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getDistanceColor(alert.distance || 0)}`}>
                          <Navigation className="w-3 h-3" />
                          {formatDistance(alert.distance || 0)} away
                        </span>
                        <span className="text-xs text-gray-500">
                          {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString('en-IN') : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition border border-blue-500/30"
                      title="View Location"
                    >
                      <MapPin className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleRespondToAlert(alert.alertId)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20"
                    >
                      I can help
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SOS Button Section */}
        <div className={`rounded-2xl backdrop-blur-xl border p-8 text-center ${
          sosActive
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-gray-900/60 border-white/[0.08]'
        }`}>
          {!sosActive ? (
            <>
              <h2 className="text-xl font-bold text-white mb-4">Emergency SOS</h2>
              <p className="text-gray-400 mb-8">Tap and hold for 3 seconds to activate emergency alert</p>

              {/* Capture mode toggle */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-sm text-gray-400">Evidence Mode:</span>
                <div className="flex rounded-xl bg-gray-800/60 border border-white/[0.08] p-1">
                  <button
                    onClick={() => setCaptureMode('photo')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      captureMode === 'photo'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-4 h-4" /> Photos
                  </button>
                  <button
                    onClick={() => setCaptureMode('video')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      captureMode === 'video'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Video className="w-4 h-4" /> Video
                  </button>
                </div>
              </div>

              <button
                onClick={handleSOSActivate}
                className="w-40 h-40 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center mx-auto shadow-2xl shadow-red-500/40 transition hover:scale-105 active:scale-95 border-4 border-red-500/30"
              >
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                  <span className="text-xl font-bold">SOS</span>
                </div>
              </button>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Mic className="w-4 h-4 text-emerald-400" /> Auto Record</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-400" /> Live Location</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4 text-purple-400" /> Alert Contacts</span>
                <span className="flex items-center gap-1"><Bell className="w-4 h-4 text-amber-400" /> Nearby Users</span>
              </div>
            </>
          ) : (
            <>
              {/* Active SOS */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-red-500/15 animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-2xl shadow-red-500/40">
                  <div className="text-center text-white">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-1 animate-bounce" />
                    <span className="text-lg font-bold">ACTIVE</span>
                    <p className="text-xs text-red-200 mt-1">{formatTimer(sosTimer)}</p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-red-400 mb-2">SOS ALERT ACTIVE</h2>
              <p className="text-gray-400 mb-4">Emergency contacts notified. Nearby users alerted.</p>

              {/* Status indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto mb-6">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                  <Mic className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="text-xs text-emerald-400 font-medium">Audio Rec</span>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                  <MapPin className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <span className="text-xs text-blue-400 font-medium">GPS Live</span>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                  <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <span className="text-xs text-purple-400 font-medium">{contacts.length} Alerted</span>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                  {captureMode === 'photo' ? (
                    <>
                      <Camera className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <span className="text-xs text-amber-400 font-medium">{capturedCount} Photos</span>
                    </>
                  ) : (
                    <>
                      <VideoIcon className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <span className="text-xs text-amber-400 font-medium">{capturedCount} Clips</span>
                    </>
                  )}
                </div>
              </div>

              {/* Camera preview */}
              <div className="relative max-w-sm mx-auto mb-6 rounded-2xl overflow-hidden border border-white/[0.08]">
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-48 object-cover bg-gray-900"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-600/80 backdrop-blur">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-xs text-white font-medium">
                    {captureMode === 'photo' ? 'Auto-capturing photos' : 'Recording video'}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-gray-900/80 backdrop-blur text-xs text-gray-300">
                  {capturedCount} {captureMode === 'photo' ? 'photos' : 'clips'} saved
                </div>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <button
                onClick={handleSOSDeactivate}
                className="px-8 py-3 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition border border-white/[0.08]"
              >
                Deactivate SOS (I am safe)
              </button>
            </>
          )}
        </div>

        {/* Quick Safety Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Phone, label: 'Fake Call', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { icon: MapPin, label: 'Share Location', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { icon: Clock, label: 'Safety Timer', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
            { icon: Camera, label: 'Quick Photo', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          ].map((action) => (
            <button
              key={action.label}
              className={`rounded-2xl backdrop-blur-xl border p-4 text-center hover:scale-[1.02] transition ${action.bg}`}
            >
              <action.icon className={`w-8 h-8 mx-auto mb-2 ${action.color}`} />
              <span className="text-sm font-medium text-gray-300">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Emergency Contacts */}
        <div className="rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-white/[0.08] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-white">Emergency Contacts</h3>
            <button
              onClick={() => setShowAddContact(true)}
              className="flex items-center gap-1 text-primary-400 text-sm font-medium hover:text-primary-300"
            >
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          </div>

          {/* Add Contact Form */}
          {showAddContact && (
            <div className="mb-4 p-4 bg-gray-800/60 rounded-xl border border-white/[0.08] space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full bg-gray-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full bg-gray-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
              />
              <select
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="w-full bg-gray-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500/50"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Spouse">Spouse</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
              <div className="flex gap-2">
                <button onClick={handleAddContact} className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition">
                  Add Contact
                </button>
                <button onClick={() => setShowAddContact(false)} className="px-4 py-2.5 bg-gray-700 text-gray-300 rounded-xl text-sm hover:bg-gray-600 transition">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                    <span className="text-primary-400 font-semibold">{contact.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {contact.name}
                      {contact.isPrimary && (
                        <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full border border-primary-500/30">Primary</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{contact.phone} · {contact.relationship}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-2 text-gray-500 hover:text-red-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* How Nearby Alerts Work */}
        <div className="rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-white/[0.08] p-5">
          <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
            <Waves className="w-5 h-5 text-primary-400" />
            How Nearby Alerts Work
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: AlertTriangle,
                title: 'SOS Activated',
                desc: 'When anyone activates SOS, their location is shared instantly',
                color: 'text-red-400 bg-red-500/10 border-red-500/20',
              },
              {
                icon: Bell,
                title: 'Nearby Users Notified',
                desc: 'All logged-in users within 5km receive a real-time alert with distance',
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              },
              {
                icon: Eye,
                title: 'Live Tracking',
                desc: 'Distance updates live as the person moves. You can respond to help',
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              },
            ].map((item) => (
              <div key={item.title} className={`p-4 rounded-xl border ${item.color}`}>
                <item.icon className={`w-8 h-8 mb-2 ${item.color.split(' ')[0]}`} />
                <h4 className="font-medium text-white mb-1">{item.title}</h4>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-white/[0.08] p-5">
          <h3 className="font-semibold text-lg text-white mb-4">Safety Tips</h3>
          <div className="space-y-3">
            {[
              'Hamesha apne trusted contacts ko update rakhein',
              'SOS feature ko test karein - ye free hai',
              'Raat ko alone travel karte waqt safety timer use karein',
              'Apni live location trusted contacts ke saath share karein',
              'Emergency number 112 yaad rakhein',
              'Evidence mode (Photo/Video) select karein SOS se pehle',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-primary-500/5 border border-primary-500/10 rounded-xl">
                <Shield className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
