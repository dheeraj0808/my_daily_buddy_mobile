import api from './api';

export interface RegisterData {
  email: string;
  full_name: string;
  phone_number?: string;
}

export const authService = {
  /**
   * Register a new user
   * Sends an OTP to the provided email.
   */
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login user
   * Sends an OTP to the email.
   */
  login: async (email: string) => {
    const response = await api.post('/auth/login', { email });
    return response.data;
  },

  /**
   * Verify OTP
   * Returns JWT token and user info.
   */
  verifyOtp: async (userId: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { userId, otp });
    return response.data;
  },

  /**
   * Resend OTP
   */
  resendOtp: async (userId: string) => {
    const response = await api.post('/auth/resend-otp', { userId });
    return response.data;
  },

  /**
   * Refresh Token
   */
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  }
};

export default authService;
