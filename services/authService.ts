import api from './api';

/**
 * Matches the backend RegisterDto exactly:
 *   email (required), first_name, last_name, phone (all optional)
 */
export interface RegisterData {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export const authService = {
  /**
   * Register a new user
   * POST /api/auth/register
   * Sends an OTP to the provided email.
   */
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   * POST /api/auth/login
   * Sends an OTP to the email (auto-creates user if not found).
   */
  login: async (email: string) => {
    const response = await api.post('/auth/login', { email });
    return response.data;
  },

  /**
   * Verify OTP
   * POST /api/auth/verify-otp
   * Returns JWT tokens and user info.
   */
  verifyOtp: async (userId: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { userId, otp });
    return response.data;
  },

  /**
   * Resend OTP
   * POST /api/auth/resend-otp
   */
  resendOtp: async (userId: string) => {
    const response = await api.post('/auth/resend-otp', { userId });
    return response.data;
  },

  /**
   * Refresh Token
   * POST /api/auth/refresh-token
   */
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },
};

export default authService;
