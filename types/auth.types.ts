export interface RegisterData {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role_id: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface OtpResponse {
  userId: string;
  expiresAt: string;
  validityMs: number;
}

export interface ApiResult<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;
  timestamp: string;
}
