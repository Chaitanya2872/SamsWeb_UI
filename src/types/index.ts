import React from 'react';

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: {
    items?: T[];
    structures?: T[];
    users?: T[];
    pagination: {
      current_page: number;
      per_page: number;
      total_items: number;
      total_pages: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
    filters?: Record<string, unknown>;
    summary?: Record<string, unknown>;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  profile?: UserProfile;
  permissions?: UserPermissions;
  isEmailVerified: boolean;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'AD' | 'TE' | 'VE' | 'FE';

export interface UserProfile {
  first_name?: string;
  last_name?: string;
  phone?: string;
  organization?: string;
  designation?: string;
  employee_id?: string;
  address?: string;
}

export interface UserPermissions {
  can_create_structures: boolean;
  can_approve_structures: boolean;
  can_delete_structures: boolean;
  can_view_all_structures: boolean;
  can_export_reports: boolean;
  can_manage_users: boolean;
}

// Authentication Types
export interface LoginCredentials {
  identifier: string;
  password: string;
  [key: string]: unknown;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
  [key: string]: unknown;
}

export interface AuthResponse {
  error: string;
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  requiresVerification?: boolean;
}

export interface OTPVerification {
  email: string;
  otp: string;
  [key: string]: unknown;
}

export interface ForgotPasswordData {
  email: string;
  [key: string]: unknown;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
  [key: string]: unknown;
}

// Structure Types
export interface Structure {
  structure_id: string;
  uid: string;
  structural_identity_number?: string;
  client_name?: string;
  custodian?: string;
  location: {
    city_name?: string;
    state_code?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    address?: string;
  };
  type_of_structure: StructureType;
  dimensions?: {
    width?: number;
    length?: number;
    height?: number;
    floors?: number;
  };
  status: StructureStatus;
  progress: StructureProgress;
  ratings_summary?: {
    total_flats: number;
    rated_flats: number;
    completion_percentage: number;
    avg_structural_rating?: number;
    avg_non_structural_rating?: number;
    overall_health?: HealthStatus;
  };
  health_metrics?: {
    average_rating?: number;
    health_status?: HealthStatus;
    priority_issues: number;
  };
  timestamps: {
    created_date: string;
    last_updated_date: string;
  };
}

export type StructureType = 'residential' | 'commercial' | 'educational' | 'hospital' | 'industrial';

export type StructureStatus = 
  | 'draft' 
  | 'location_completed' 
  | 'admin_completed' 
  | 'geometric_completed' 
  | 'ratings_in_progress' 
  | 'flat_ratings_completed' 
  | 'submitted' 
  | 'approved'
  | 'requires_inspection'
  | 'maintenance_needed';

export type HealthStatus = 'Good' | 'Fair' | 'Poor' | 'Critical';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface StructureProgress {
  location: boolean;
  administrative: boolean;
  geometric_details: boolean;
  floors_added: boolean;
  flats_added: boolean;
  flat_ratings_completed: boolean;
  overall_percentage: number;
}

export interface StructureDetails extends Structure {
  administration?: {
    client_name?: string;
    custodian?: string;
    engineer_designation?: string;
    contact_details?: string;
    email_id?: string;
    organization?: string;
  };
  geometric_details?: {
    number_of_floors?: number;
    structure_width?: number;
    structure_length?: number;
    structure_height?: number;
    total_area?: number;
  };
  statistics: {
    total_floors: number;
    total_flats: number;
    rated_flats: number;
    pending_ratings: number;
    critical_issues: number;
    high_priority_issues: number;
  };
  health_summary: {
    overall_health_score?: number;
    structural_health?: number;
    non_structural_health?: number;
    priority_level?: Priority;
    last_assessment_date?: string;
  };
  floors: Floor[];
  maintenance_recommendations: {
    total_recommendations: number;
    critical: number;
    high: number;
    medium: number;
    recent_recommendations: MaintenanceRecommendation[];
  };
  remarks: {
    fe_remarks: Remark[];
    ve_remarks: Remark[];
    total_fe_remarks: number;
    total_ve_remarks: number;
    last_updated_by: Record<string, unknown>;
    user_permissions: {
      can_view_remarks: boolean;
      can_add_remarks: boolean;
      can_edit_own_remarks: boolean;
      user_role?: UserRole;
    };
  };
}

export interface Floor {
  floor_id: string;
  mongodb_id: string;
  floor_number: number;
  floor_type: string;
  floor_height?: number;
  total_area_sq_mts?: number;
  floor_label_name: string;
  floor_notes?: string;
  flats: Flat[];
}

export interface Flat {
  flat_id: string;
  mongodb_id: string;
  flat_number: string;
  flat_type: string;
  area_sq_mts?: number;
  direction_facing: string;
  occupancy_status: string;
  flat_notes?: string;
  has_structural_ratings: boolean;
  has_non_structural_ratings: boolean;
  structural_rating?: StructuralRating;
  non_structural_rating?: NonStructuralRating;
  flat_overall_rating?: FlatOverallRating;
  images?: Image[];
}

export interface RatingComponent {
  rating?: number;
  condition_comment?: string;
  inspection_date?: string;
  photos?: string[];
  inspector_notes?: string;
}

export interface StructuralRating {
  beams?: RatingComponent;
  columns?: RatingComponent;
  slab?: RatingComponent;
  foundation?: RatingComponent;
  overall_average?: number;
  health_status?: HealthStatus;
  assessment_date?: string;
}

export interface NonStructuralRating {
  brick_plaster?: RatingComponent;
  doors_windows?: RatingComponent;
  flooring_tiles?: RatingComponent;
  electrical_wiring?: RatingComponent;
  sanitary_fittings?: RatingComponent;
  railings?: RatingComponent;
  water_tanks?: RatingComponent;
  plumbing?: RatingComponent;
  sewage_system?: RatingComponent;
  panel_board?: RatingComponent;
  lifts?: RatingComponent;
  overall_average?: number;
  assessment_date?: string;
}

export interface FlatOverallRating {
  combined_score?: number;
  health_status?: HealthStatus;
  priority?: Priority;
  last_assessment_date?: string;
}

export interface MaintenanceRecommendation {
  type: 'Structural' | 'Non-Structural';
  priority: Priority;
  component: string;
  location: string;
  issue: string;
  rating: number;
  urgency: string;
  estimated_cost: {
    estimated_amount: number;
    currency: string;
    range: {
      min: number;
      max: number;
    };
  };
  recommended_action: string;
}

export interface Remark {
  _id: string;
  text: string;
  author_name: string;
  author_role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Image {
  image_id: string;
  image_url: string;
  rating_type: 'structural' | 'non_structural';
  component: string;
  rating?: number;
  condition_comment?: string;
  inspector_notes?: string;
  uploaded_date: string;
  flat_id: string;
  flat_number: string;
  flat_type: string;
  floor_number?: number;
  floor_label?: string;
  structure_id?: string;
  structure_number?: string;
}

// Dashboard Types
export interface DashboardData {
  user_info: {
    user_id: string;
    username: string;
    email: string;
    total_structures: number;
  };
  structure_overview: {
    total_structures: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    by_health: Record<string, number>;
    completion_rates: {
      fully_completed: number;
      ratings_completed: number;
      partially_completed: number;
      just_initialized: number;
    };
  };
  ratings_overview: {
    total_flats: number;
    rated_flats: number;
    pending_ratings: number;
    structural_avg?: number;
    non_structural_avg?: number;
    critical_issues: number;
    high_priority_issues: number;
  };
  recent_activity: {
    recent_structures: RecentStructure[];
    recent_ratings: RecentRating[];
    recent_uploads: Record<string, unknown>[];
  };
  maintenance_alerts: {
    critical_items: Record<string, unknown>[];
    upcoming_inspections: Record<string, unknown>[];
    overdue_items: Record<string, unknown>[];
  };
  image_overview: {
    total_images: number;
    avg_images_per_structure: number;
    documentation_completeness: number;
  };
}

export interface RecentStructure {
  structure_id: string;
  uid: string;
  structure_number?: string;
  client_name?: string;
  status: StructureStatus;
  progress: number;
  last_updated: string;
}

export interface RecentRating {
  structure_number?: string;
  location: string;
  combined_score: number;
  health_status: HealthStatus;
  assessment_date: string;
}

// Admin Types
export interface SystemStats {
  users: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    adminUsers: number;
    inspectorUsers: number;
    engineerUsers: number;
    viewerUsers: number;
  };
  structures: {
    totalStructures: number;
    draftStructures: number;
    submittedStructures: number;
    approvedStructures: number;
    requiresInspection: number;
    maintenanceNeeded: number;
    residentialCount: number;
    commercialCount: number;
    educationalCount: number;
    hospitalCount: number;
    industrialCount: number;
  };
  inspections: {
    totalInspections: number;
    pendingInspections: number;
    completedInspections: number;
    followupRequired: number;
    routineInspections: number;
    detailedInspections: number;
    emergencyInspections: number;
  };
  recentActivity: {
    newUsers: User[];
    newStructures: Structure[];
    recentInspections: Record<string, unknown>[];
  };
}

// Filter and Search Types
export interface StructureFilters {
  status?: StructureStatus;
  type?: StructureType;
  health?: HealthStatus;
  location?: string;
  date_from?: string;
  date_to?: string;
  min_rating?: number;
  max_rating?: number;
  has_issues?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

// Component Props Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface StatusBadgeProps {
  status: StructureStatus | HealthStatus | Priority | UserRole;
  size?: 'sm' | 'md' | 'lg';
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Form validation types
export type ValidationRule = 
  | { required: boolean; message?: string }
  | { minLength: number; message?: string }
  | { maxLength: number; message?: string }
  | { pattern: RegExp; message?: string }
  | { min: number; message?: string }
  | { max: number; message?: string }
  | { custom: (value: unknown) => boolean | string; message?: string };

export type FormValidation = ValidationRule | ValidationRule[];

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'number' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string; }[];
  validation?: FormValidation;
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}