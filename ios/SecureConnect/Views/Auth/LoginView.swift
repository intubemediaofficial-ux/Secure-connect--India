import SwiftUI

struct LoginView: View {
    @State private var phone: String = ""
    @State private var otp: String = ""
    @State private var step: LoginStep = .phone
    @State private var isLoading: Bool = false
    @State private var countdown: Int = 0
    
    enum LoginStep {
        case phone, otp
    }
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            
            // Logo
            VStack(spacing: 8) {
                Image(systemName: "shield.checkered")
                    .font(.system(size: 48))
                    .foregroundColor(.blue)
                
                Text("SecureConnect")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.blue)
                
                Text("Your Safety, Our Priority")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Form
            VStack(spacing: 20) {
                if step == .phone {
                    phoneView
                } else {
                    otpView
                }
            }
            .padding(.horizontal, 24)
            
            Spacer()
            
            // Footer
            Text("By continuing, you agree to our Terms & Privacy Policy")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
    }
    
    private var phoneView: some View {
        VStack(spacing: 16) {
            Text("Enter Phone Number")
                .font(.title3)
                .fontWeight(.semibold)
            
            HStack {
                Text("+91")
                    .font(.body)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 14)
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                
                TextField("10 digit number", text: $phone)
                    .keyboardType(.numberPad)
                    .padding(14)
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                    .onChange(of: phone) { newValue in
                        phone = String(newValue.filter { $0.isNumber }.prefix(10))
                    }
            }
            
            Button(action: sendOTP) {
                HStack {
                    if isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: "phone.fill")
                        Text("Send OTP")
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(phone.count == 10 ? Color.blue : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .disabled(phone.count != 10 || isLoading)
        }
    }
    
    private var otpView: some View {
        VStack(spacing: 16) {
            Text("Verify OTP")
                .font(.title3)
                .fontWeight(.semibold)
            
            Text("Sent to +91 \(phone)")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            TextField("Enter 6-digit OTP", text: $otp)
                .keyboardType(.numberPad)
                .multilineTextAlignment(.center)
                .font(.title2)
                .tracking(8)
                .padding(14)
                .background(Color(.systemGray6))
                .cornerRadius(10)
                .onChange(of: otp) { newValue in
                    otp = String(newValue.filter { $0.isNumber }.prefix(6))
                }
            
            Button(action: verifyOTP) {
                HStack {
                    if isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: "checkmark.circle.fill")
                        Text("Verify & Login")
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(otp.count == 6 ? Color.blue : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .disabled(otp.count != 6 || isLoading)
            
            Button("Change Phone Number") {
                step = .phone
                otp = ""
            }
            .font(.subheadline)
        }
    }
    
    private func sendOTP() {
        isLoading = true
        // TODO: Call API
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            isLoading = false
            step = .otp
            countdown = 60
        }
    }
    
    private func verifyOTP() {
        isLoading = true
        // TODO: Call API
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            isLoading = false
            // Navigate to Dashboard
        }
    }
}
