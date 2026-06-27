const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

async function apiCall<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await res.json();
    return data;
  } catch {
    return { success: false, message: 'Network error. Please check your connection.' };
  }
}

export const api = {
  auth: {
    sendPhoneOTP: (phone: string) =>
      apiCall('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }),

    sendEmailOTP: (email: string) =>
      apiCall('/auth/send-email-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    verifyPhoneOTP: (phone: string, otp: string) =>
      apiCall('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      }),

    verifyEmailOTP: (email: string, otp: string) =>
      apiCall('/auth/verify-email-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      }),

    resendOTP: (phone: string) =>
      apiCall('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }),

    getProfile: () => apiCall('/auth/me'),

    logout: (refreshToken: string) =>
      apiCall('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
  },
};
