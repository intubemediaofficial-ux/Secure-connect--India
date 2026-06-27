# SecureConnect India

India's most trusted platform for **women safety**, **personal consultation**, **mental wellness**, and **emergency support**.

## Features

### Emergency Safety System (FREE)
- **SOS Activation** - Power button press, app button, or voice trigger
- **Live Location Sharing** - Real-time GPS tracking during emergencies
- **Evidence Collection** - Auto audio/video recording, photo capture
- **Emergency Contacts** - Instant SMS/push alerts to trusted contacts
- **Nearby Users Alert** - 5km radius community protection
- **Safety Check-ins** - Scheduled check-ins with missed alert system
- **Fake Call** - Generate fake incoming calls for escape

### Personal Consultation (PAID - Per Minute)
- Relationship, Marriage, Family, Breakup support
- Loneliness, Personal Life, Emotional Stress guidance
- Licensed psychologists and counselors
- Chat & Voice Call modes
- Anonymous consultation option

### Mental Wellness (PAID)
- Stress, Anxiety, Depression support
- Licensed mental health professionals
- End-to-end encrypted sessions

### Women's Health Guidance (PAID)
- Period problems, White discharge, PCOS awareness
- Pregnancy-related general questions
- Hygiene guidance from certified doctors

## Tech Stack

### Backend
- **Runtime**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Real-time**: Socket.IO
- **Auth**: JWT + OTP (Twilio SMS)
- **Payments**: Razorpay
- **Storage**: AWS S3
- **Push Notifications**: Firebase Admin SDK
- **Cache**: Redis

### Web Application
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript + Tailwind CSS
- **State**: Zustand
- **Real-time**: Socket.IO Client
- **Maps**: Leaflet / React-Leaflet

### Mobile
- **Android**: Kotlin + Jetpack Compose + Hilt + Room
- **iOS**: Swift + SwiftUI + CoreLocation

## Project Structure

```
SecureConnect-India/
├── backend/               # Node.js Express API
│   ├── prisma/           # Database schema & migrations
│   ├── src/
│   │   ├── config/       # App configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, error handling
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic (OTP, email, payments)
│   │   ├── socket/       # WebSocket handlers
│   │   └── server.ts     # App entry point
│   └── package.json
├── web/                   # Next.js web application
│   ├── src/
│   │   ├── app/          # Pages (App Router)
│   │   ├── styles/       # Global styles
│   │   └── lib/          # Utilities
│   └── package.json
├── android/               # Android native (Kotlin)
│   └── app/src/main/java/com/secureconnect/india/
└── ios/                   # iOS native (Swift)
    └── SecureConnect/
```

## Setup & Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis (optional, for caching)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend runs on `http://localhost:5000`

### Web App Setup

```bash
cd web
npm install
npm run dev
```

Web app runs on `http://localhost:3000`

### Environment Variables

Copy `backend/.env.example` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `TWILIO_*` - SMS OTP service
- `RAZORPAY_*` - Payment gateway
- `AWS_*` - File storage (S3)
- `FIREBASE_*` - Push notifications

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP & login
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Emergency SOS
- `POST /api/sos/activate` - Activate SOS alert
- `POST /api/sos/deactivate/:alertId` - Deactivate alert
- `POST /api/sos/location-update` - Update live location
- `GET /api/sos/active` - Get active alert
- `GET /api/sos/nearby` - Get nearby active alerts
- `POST /api/sos/contacts` - Add emergency contact

### Consultation
- `GET /api/consultations/experts` - List experts (filter by category)
- `POST /api/consultations/request` - Request consultation
- `POST /api/consultations/accept/:id` - Expert accepts
- `POST /api/consultations/end/:id` - End consultation (billing)
- `POST /api/consultations/rate/:id` - Rate consultation

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/recharge/create-order` - Create Razorpay order
- `POST /api/wallet/recharge/verify` - Verify payment
- `GET /api/wallet/transactions` - Transaction history

### Admin
- `GET /api/admin/dashboard` - Platform stats
- `GET /api/admin/users` - Manage users
- `GET /api/admin/experts` - Manage experts
- `GET /api/admin/sos-alerts` - Monitor SOS alerts
- `GET /api/admin/revenue` - Revenue analytics

## Security

- End-to-end encryption for chat messages
- JWT authentication with refresh tokens
- Rate limiting on all endpoints
- Input validation and sanitization
- Secure cloud storage for evidence
- CORS configured for allowed origins
- Helmet.js security headers
- Anonymous consultation support

## License

Proprietary - All rights reserved.

## Support

- Emergency: 112 (India)
- Women Helpline: 1091
- Email: support@secureconnect.in
