import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api/v1`;

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post(`${API_BASE}/auth/refresh-token`, {
          refreshToken
        });

        useAuthStore.getState().setAuth(
          data.user,
          data.accessToken,
          data.refreshToken,
          data.user.role
        );

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Service Methods
export const api = {
  // Auth APIs
  auth: {
    sendOTP: (phoneNumber) => apiClient.post('/auth/send-otp', { phoneNumber }),
    verifyOTP: (phoneNumber, otp) => apiClient.post('/auth/verify-otp', { phoneNumber, otp }),
    register: (userData) => apiClient.post('/auth/register', userData),
    login: (credentials) => apiClient.post('/auth/login', credentials),
    logout: () => apiClient.post('/auth/logout'),
    refreshToken: (refreshToken) => apiClient.post('/auth/refresh-token', { refreshToken })
  },

  // User APIs
  user: {
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (data) => apiClient.put('/users/profile', data),
    switchRole: (role) => apiClient.put('/users/role', { role }),
    uploadPhoto: (formData) => apiClient.post('/users/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Rider APIs
  rider: {
    getProfile: (riderId) => apiClient.get(`/riders/${riderId}`),
    updateProfile: (riderId, data) => apiClient.put(`/riders/${riderId}`, data),
    getRideHistory: () => apiClient.get('/riders/rides/history'),
    getSavedLocations: () => apiClient.get('/riders/saved-locations'),
    addSavedLocation: (location) => apiClient.post('/riders/saved-locations', location)
  },

  // Driver APIs
  driver: {
    getProfile: (driverId) => apiClient.get(`/drivers/${driverId}`),
    updateProfile: (driverId, data) => apiClient.put(`/drivers/${driverId}`, data),
    toggleOnline: (isOnline) => apiClient.post('/drivers/toggle-online', { isOnline }),
    getEarnings: () => apiClient.get('/drivers/earnings'),
    getRideHistory: () => apiClient.get('/drivers/rides/history'),
    acceptRide: (rideId) => apiClient.post('/drivers/accept-ride', { rideId }),
    rejectRide: (rideId) => apiClient.post('/drivers/reject-ride', { rideId }),
    updateLocation: (location) => apiClient.post('/drivers/location', location)
  },

  // Ride APIs
  rides: {
    estimate: (pickup, dropoff, vehicleType) => apiClient.post('/rides/estimate', {
      pickup,
      dropoff,
      vehicleType
    }),
    create: (rideData) => apiClient.post('/rides/create', rideData),
    get: (rideId) => apiClient.get(`/rides/${rideId}`),
    cancel: (rideId, reason) => apiClient.put(`/rides/${rideId}/cancel`, { reason }),
    rate: (rideId, rating, review) => apiClient.post(`/rides/${rideId}/rate`, {
      rating,
      review
    }),
    updateLocation: (rideId, location) => apiClient.post(`/rides/${rideId}/update-location`, location),
    startRide: (rideId) => apiClient.post(`/rides/${rideId}/start`),
    completeRide: (rideId) => apiClient.post(`/rides/${rideId}/complete`)
  },

  // Fare APIs
  fares: {
    calculate: (params) => apiClient.post('/fares/calculate', params),
    validate: (rideId, userOfferedFare) => apiClient.post('/fares/validate', {
      rideId,
      userOfferedFare
    })
  },

  // Safety APIs
  safety: {
    triggerSOS: (rideId, location) => apiClient.post('/safety/sos', {
      rideId,
      location
    }),
    shareRide: (rideId, contacts) => apiClient.post('/safety/share-ride', {
      rideId,
      contacts
    }),
    getRideShare: (shareToken) => apiClient.get(`/safety/ride-share/${shareToken}`)
  },

  // Payment APIs
  payment: {
    initiate: (rideId, paymentMethod) => apiClient.post('/payments/initiate', {
      rideId,
      paymentMethod
    }),
    getStatus: (transactionId) => apiClient.get(`/payments/${transactionId}/status`),
    refund: (rideId) => apiClient.post('/payments/refund', { rideId })
  },

  // Wallet APIs
  wallet: {
    getBalance: () => apiClient.get('/wallet/balance'),
    addMoney: (amount, paymentMethod) => apiClient.post('/wallet/add-money', {
      amount,
      paymentMethod
    }),
    getTransactions: (params) => apiClient.get('/wallet/transactions', { params })
  }
};

export default apiClient;
