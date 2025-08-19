export interface User {
    identifier: string;
    username: string;
    email: string;
    role: 'AD' | 'TE' | 'VE' | 'FE';
    roles: ('AD' | 'TE' | 'VE' | 'FE')[];
    profile?: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      organization?: string;
      designation?: string;
      employee_id?: string;
      address?: string;
    };
    permissions: {
      can_create_structures: boolean;
      can_approve_structures: boolean;
      can_delete_structures: boolean;
      can_view_all_structures: boolean;
      can_export_reports: boolean;
      can_manage_users: boolean;
    };
    stats?: {
      total_structures_created: number;
      total_structures_submitted: number;
      total_structures_approved: number;
      last_activity_date: string;
      total_login_count: number;
    };
    is_active: boolean;
    isEmailVerified: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface LoginRequest {
    identifier: string;
    password: string;
  }
  
  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface LoginResponse {
    success: boolean;
    message: string;
    user: User;
    accessToken: string;
    refreshToken: string;
  }
  
  export interface RegisterResponse {
    success: boolean;
    message: string;
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
    requiresEmailVerification: boolean;
  }
  
  export interface AuthContextType {
    user: User | null;
    login: (credentials: LoginRequest) => Promise<LoginResponse>;
    register: (userData: RegisterRequest) => Promise<RegisterResponse>;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
  }
  
  export interface RefreshTokenResponse {
    success: boolean;
    accessToken: string;
    refreshToken: string;
  }