import SwiftUI
import CoreLocation

struct SOSView: View {
    @State private var sosActive = false
    @State private var pulseAnimation = false
    @StateObject private var locationManager = LocationManager()
    
    var body: some View {
        VStack(spacing: 32) {
            if !sosActive {
                inactiveView
            } else {
                activeView
            }
        }
        .padding()
        .navigationTitle("Emergency SOS")
    }
    
    private var inactiveView: some View {
        VStack(spacing: 24) {
            Text("Emergency SOS")
                .font(.title)
                .fontWeight(.bold)
            
            Text("Tap the button in case of emergency")
                .foregroundColor(.secondary)
            
            // SOS Button
            ZStack {
                Circle()
                    .fill(Color.red.opacity(0.1))
                    .frame(width: 220, height: 220)
                    .scaleEffect(pulseAnimation ? 1.2 : 1.0)
                    .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: pulseAnimation)
                
                Circle()
                    .fill(Color.red.opacity(0.2))
                    .frame(width: 180, height: 180)
                
                Button(action: activateSOS) {
                    VStack(spacing: 8) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 40))
                        Text("SOS")
                            .font(.title)
                            .fontWeight(.bold)
                    }
                    .foregroundColor(.white)
                    .frame(width: 140, height: 140)
                    .background(Color.red)
                    .clipShape(Circle())
                    .shadow(color: .red.opacity(0.5), radius: 20)
                }
            }
            .onAppear { pulseAnimation = true }
            
            HStack(spacing: 24) {
                Label("Auto Record", systemImage: "mic.fill")
                Label("Live Location", systemImage: "location.fill")
                Label("Alert", systemImage: "bell.fill")
            }
            .font(.caption)
            .foregroundColor(.secondary)
        }
    }
    
    private var activeView: some View {
        VStack(spacing: 24) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 60))
                .foregroundColor(.red)
                .symbolEffect(.pulse)
            
            Text("SOS ACTIVE")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.red)
            
            Text("Emergency contacts have been notified")
                .foregroundColor(.secondary)
            
            // Status indicators
            HStack(spacing: 12) {
                StatusBadge(title: "Recording", color: .green, icon: "mic.fill")
                StatusBadge(title: "Tracking", color: .blue, icon: "location.fill")
                StatusBadge(title: "Alerting", color: .purple, icon: "bell.fill")
            }
            
            Spacer()
            
            Button("Deactivate (I am safe)") {
                deactivateSOS()
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(.systemGray5))
            .cornerRadius(12)
        }
    }
    
    private func activateSOS() {
        sosActive = true
        // TODO: Start location tracking, audio recording, alert contacts
        locationManager.startTracking()
    }
    
    private func deactivateSOS() {
        sosActive = false
        locationManager.stopTracking()
    }
}

struct StatusBadge: View {
    let title: String
    let color: Color
    let icon: String
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title3)
            Text(title)
                .font(.caption2)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(color.opacity(0.1))
        .foregroundColor(color)
        .cornerRadius(8)
    }
}

// Location Manager
class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    @Published var location: CLLocation?
    
    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.requestAlwaysAuthorization()
    }
    
    func startTracking() {
        manager.startUpdatingLocation()
        manager.allowsBackgroundLocationUpdates = true
    }
    
    func stopTracking() {
        manager.stopUpdatingLocation()
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        location = locations.last
        // TODO: Send location to server via WebSocket
    }
}
