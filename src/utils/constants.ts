export const API_BASE_URL = 'http://localhost:5000/api';

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

export const STRUCTURE_ENDPOINTS = {
  LIST: '/structures',
  DETAILS: '/structures/:id',
  REMARKS: '/structures/:id/remarks',
  UPDATE_REMARK: '/structures/:id/remarks/:remarkId',
  DELETE_REMARK: '/structures/:id/remarks/:remarkId',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
} as const;

export const USER_ROLES = {
  AD: 'AD', // Admin
  TE: 'TE', // Technical Engineer
  VE: 'VE', // Verification Engineer
  FE: 'FE', // Field Engineer
} as const;

export const STRUCTURE_STATUS = {
  DRAFT: 'draft',
  LOCATION_COMPLETED: 'location_completed',
  ADMIN_COMPLETED: 'admin_completed',
  GEOMETRIC_COMPLETED: 'geometric_completed',
  RATINGS_IN_PROGRESS: 'ratings_in_progress',
  FLAT_RATINGS_COMPLETED: 'flat_ratings_completed',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
} as const;

export const HEALTH_STATUS = {
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
  CRITICAL: 'Critical',
} as const;

export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
} as const;

export const STATUS_COLORS = {
  [HEALTH_STATUS.GOOD]: 'status-good',
  [HEALTH_STATUS.FAIR]: 'status-fair',
  [HEALTH_STATUS.POOR]: 'status-poor',
  [HEALTH_STATUS.CRITICAL]: 'status-critical',
  [STRUCTURE_STATUS.DRAFT]: 'status-draft',
  [STRUCTURE_STATUS.SUBMITTED]: 'status-submitted',
  [STRUCTURE_STATUS.APPROVED]: 'status-approved',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 12,
  MAX_LIMIT: 50,
} as const;