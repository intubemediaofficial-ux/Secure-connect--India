export const APP_CONFIG = {
  name: 'SecureConnect India',
  version: '1.0.0',
  supportEmail: 'support@secureconnect.in',
  supportPhone: '+91-9999999999',
};

export const OTP_CONFIG = {
  length: 6,
  expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '5'),
  maxAttempts: 3,
  resendCooldownSeconds: 60,
};

export const WALLET_CONFIG = {
  rechargeOptions: [99, 199, 499, 999, 1999, 4999],
  minBalance: 0,
  currency: 'INR',
  maxRechargeAmount: 10000,
  lowBalanceThreshold: 50,
};

export const CONSULTATION_CONFIG = {
  minDurationSeconds: 60,
  maxDurationMinutes: 120,
  bufferTimeSeconds: 30,
  platformFeePercent: parseInt(process.env.PLATFORM_FEE_PERCENT || '20'),
};

export const SOS_CONFIG = {
  nearbyRadiusMeters: (parseInt(process.env.SOS_NEARBY_RADIUS_KM || '5')) * 1000,
  maxActiveAlerts: 1,
  locationUpdateIntervalMs: 5000,
  autoEscalateMinutes: 5,
  evidenceRetentionDays: 90,
  maxEmergencyContacts: parseInt(process.env.MAX_EMERGENCY_CONTACTS || '5'),
};

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
};

export const EXPERT_CATEGORIES = {
  RELATIONSHIP: { label: 'Relationship Problems', labelHi: 'रिश्ते की समस्या' },
  MARRIAGE: { label: 'Marriage Problems', labelHi: 'शादी की समस्या' },
  FAMILY: { label: 'Family Problems', labelHi: 'पारिवारिक समस्या' },
  BREAKUP: { label: 'Breakup', labelHi: 'ब्रेकअप' },
  LONELINESS: { label: 'Loneliness', labelHi: 'अकेलापन' },
  PERSONAL_LIFE: { label: 'Personal Life', labelHi: 'व्यक्तिगत जीवन' },
  EMOTIONAL_STRESS: { label: 'Emotional Stress', labelHi: 'भावनात्मक तनाव' },
  PSYCHOLOGY: { label: 'Psychology', labelHi: 'मनोविज्ञान' },
  MENTAL_WELLNESS: { label: 'Mental Wellness', labelHi: 'मानसिक स्वास्थ्य' },
  ANXIETY: { label: 'Anxiety', labelHi: 'चिंता' },
  STRESS: { label: 'Stress', labelHi: 'तनाव' },
  WOMENS_HEALTH: { label: "Women's Health", labelHi: 'महिला स्वास्थ्य' },
  PERIOD_PROBLEMS: { label: 'Period Problems', labelHi: 'पीरियड समस्या' },
  PCOS: { label: 'PCOS', labelHi: 'पीसीओएस' },
  PREGNANCY: { label: 'Pregnancy', labelHi: 'गर्भावस्था' },
  HYGIENE: { label: 'Hygiene', labelHi: 'स्वच्छता' },
};
