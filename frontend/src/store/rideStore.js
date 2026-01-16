import { create } from 'zustand';

export const useRideStore = create((set, get) => ({
  // Current Ride State
  currentRide: null,
  rideStatus: 'idle', // idle | searching | driver_assigned | driver_arrived | in_ride | completed | cancelled
  
  // Booking Details
  pickup: null,
  dropoff: null,
  vehicleType: 'sedan',
  fareEstimate: null,
  offeredFare: null,
  
  // Driver Info (when assigned)
  driver: null,
  driverLocation: null,
  eta: null,
  
  // Real-time tracking
  route: null,
  currentLocation: null,
  
  // Actions
  setPickup: (location) => set({ pickup: location }),
  setDropoff: (location) => set({ dropoff: location }),
  setVehicleType: (type) => set({ vehicleType: type }),
  setFareEstimate: (estimate) => set({ fareEstimate: estimate }),
  setOfferedFare: (fare) => set({ offeredFare: fare }),
  
  setCurrentRide: (ride) => set({
    currentRide: ride,
    rideStatus: ride?.status || 'idle'
  }),
  
  updateRideStatus: (status) => set((state) => ({
    rideStatus: status,
    currentRide: state.currentRide ? {
      ...state.currentRide,
      status
    } : null
  })),
  
  setDriver: (driver) => set({ driver }),
  updateDriverLocation: (location) => set({ driverLocation: location }),
  updateETA: (eta) => set({ eta }),
  
  setRoute: (route) => set({ route }),
  updateCurrentLocation: (location) => set({ currentLocation: location }),
  
  clearRide: () => set({
    currentRide: null,
    rideStatus: 'idle',
    pickup: null,
    dropoff: null,
    fareEstimate: null,
    offeredFare: null,
    driver: null,
    driverLocation: null,
    eta: null,
    route: null
  }),
  
  // Getters
  isActiveRide: () => {
    const status = get().rideStatus;
    return ['searching', 'driver_assigned', 'driver_arrived', 'in_ride'].includes(status);
  }
}));
