import axios from 'axios';

/**
 * API Configuration for Mobile App
 * 
 * IMPORTANT FOR MOBILE TESTING:
 * - iOS Simulator: Use 'http://localhost:3001/api'
 * - Android Emulator: Use 'http://10.0.2.2:3001/api'
 * - Physical Device: Use your computer's IP (e.g., 'http://192.168.1.5:3001/api')
 */

const BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for easy debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
