import { create } from 'zustand';

export const useDriverStore = create((set, get) => ({
  // Driver Status
  isOnline: false,
  currentLocation: null,

  // Active Ride
  activeRide: null,
  rideStatus: 'idle',

  // Ride Requests
  pendingRequests: [],

  // Earnings & Stats
  todayEarnings: 0,
  totalRides: 0,
  acceptanceRate: 0,
  rating: 5.0,

  // Actions
  toggleOnline: () => set((state) => ({ isOnline: !state.isOnline })),
  setOnline: (status) => set({ isOnline: status }),

  updateLocation: (location) => set({ currentLocation: location }),

  setActiveRide: (ride) => set({
    activeRide: ride,
    rideStatus: ride?.status || 'idle'
  }),

  updateRideStatus: (status) => set((state) => ({
    rideStatus: status,
    activeRide: state.activeRide ? {
      ...state.activeRide,
      status
    } : null
  })),

  addRideRequest: (request) => set((state) => ({
    pendingRequests: [...state.pendingRequests, request]
  })),

  removeRideRequest: (requestId) => set((state) => ({
    pendingRequests: state.pendingRequests.filter(r => r.id !== requestId)
  })),

  clearRideRequests: () => set({ pendingRequests: [] }),

  updateEarnings: (amount) => set((state) => ({
    todayEarnings: state.todayEarnings + amount
  })),

  updateStats: (stats) => set({
    totalRides: stats.totalRides,
    acceptanceRate: stats.acceptanceRate,
    rating: stats.rating
  }),

  clearActiveRide: () => set({
    activeRide: null,
    rideStatus: 'idle'
  })
}));
