package com.secureconnect.india.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.location.Location
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * Foreground service for SOS functionality.
 * Handles:
 * - Continuous GPS location tracking
 * - Audio recording as evidence
 * - Photo/video capture
 * - Real-time location sharing with emergency contacts
 * - Background operation even when app is minimized
 */
class SOSService : Service() {

    companion object {
        const val CHANNEL_ID = "sos_channel"
        const val NOTIFICATION_ID = 1001
        const val ACTION_START_SOS = "com.secureconnect.india.START_SOS"
        const val ACTION_STOP_SOS = "com.secureconnect.india.STOP_SOS"
    }

    private var mediaRecorder: MediaRecorder? = null
    private var isRecording = false
    private var isTracking = false

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_SOS -> startSOS()
            ACTION_STOP_SOS -> stopSOS()
        }
        return START_STICKY
    }

    private fun startSOS() {
        // Start foreground service with notification
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)

        // Start location tracking
        startLocationTracking()

        // Start audio recording
        startAudioRecording()

        // Alert emergency contacts via API
        alertEmergencyContacts()
    }

    private fun stopSOS() {
        stopAudioRecording()
        stopLocationTracking()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun startLocationTracking() {
        isTracking = true
        // TODO: Implement FusedLocationProviderClient for continuous GPS updates
        // Update every 5 seconds during SOS
        // Send updates to backend via WebSocket
    }

    private fun stopLocationTracking() {
        isTracking = false
    }

    private fun startAudioRecording() {
        try {
            // TODO: Implement MediaRecorder for audio evidence
            // Save to secure internal storage
            // Upload to cloud in background
            isRecording = true
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun stopAudioRecording() {
        try {
            mediaRecorder?.apply {
                stop()
                release()
            }
            mediaRecorder = null
            isRecording = false
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun alertEmergencyContacts() {
        // TODO: Call API to notify all emergency contacts
        // Send SMS with location link
        // Push notification to nearby app users
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SOS Active")
            .setContentText("Emergency alert is active. Your contacts have been notified.")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "SOS Emergency",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Emergency SOS notifications"
                enableVibration(true)
            }

            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }
}
