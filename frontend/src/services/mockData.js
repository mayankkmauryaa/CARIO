// Mock data for development and testing

export const mockUser = {
  id: 'user-001',
  phoneNumber: '+1234567890',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  role: 'both',
  profileImage: null,
  isVerified: true,
  createdAt: new Date().toISOString()
};

export const mockDriver = {
  id: 'driver-001',
  userId: 'user-001',
  fullName: 'Jane Smith',
  vehicleType: 'sedan',
  vehicleNumber: 'ABC-1234',
  vehicleModel: 'Toyota Camry 2022',
  licenseNumber: 'DL-123456',
  rating: 4.8,
  totalRides: 1247,
  profileImage: null,
  isOnline: true,
  location: {
    lat: 37.7749,
    lng: -122.4194
  }
};

export const mockFareEstimate = {
  distance: 8.5,
  estimatedDuration: 22,
  baseFare: 5.0,
  distanceCost: 12.75,
  timeCost: 3.67,
  surgeMultiplier: 1.0,
  platformFee: 2.14,
  recommendedFare: 23.56,
  minimumFare: 18.50,
  breakdown: {
    base: 5.0,
    distance: '8.5 km × $1.50',
    time: '22 min × $0.167',
    surge: '1.0x',
    platformFee: '10%'
  }
};

export const mockRide = {
  id: 'ride-001',
  riderId: 'rider-001',
  driverId: 'driver-001',
  status: 'driver_assigned',
  pickup: {
    lat: 37.7749,
    lng: -122.4194,
    address: '123 Market St, San Francisco, CA 94103'
  },
  dropoff: {
    lat: 37.7849,
    lng: -122.4094,
    address: '456 Mission St, San Francisco, CA 94105'
  },
  distance: 8.5,
  estimatedDuration: 22,
  vehicleType: 'sedan',
  offeredFare: 23.56,
  finalFare: 23.56,
  createdAt: new Date().toISOString(),
  driver: mockDriver
};

export const mockRideHistory = [
  {
    id: 'ride-h-001',
    date: '2024-01-15',
    pickup: 'Downtown SF',
    dropoff: 'Airport',
    fare: 45.50,
    distance: 15.2,
    duration: 28,
    driver: 'Michael Chen',
    rating: 5,
    status: 'completed'
  },
  {
    id: 'ride-h-002',
    date: '2024-01-14',
    pickup: 'Home',
    dropoff: 'Office',
    fare: 18.75,
    distance: 6.8,
    duration: 15,
    driver: 'Sarah Johnson',
    rating: 4,
    status: 'completed'
  },
  {
    id: 'ride-h-003',
    date: '2024-01-13',
    pickup: 'Mall',
    dropoff: 'Restaurant',
    fare: 12.30,
    distance: 4.2,
    duration: 12,
    driver: 'David Lee',
    rating: 5,
    status: 'completed'
  }
];

export const mockSavedLocations = [
  {
    id: 'loc-001',
    name: 'Home',
    address: '789 Oak St, San Francisco, CA 94110',
    lat: 37.7599,
    lng: -122.4148,
    icon: 'home'
  },
  {
    id: 'loc-002',
    name: 'Work',
    address: '321 Pine St, San Francisco, CA 94104',
    lat: 37.7919,
    lng: -122.4065,
    icon: 'briefcase'
  }
];

export const mockDriverEarnings = {
  today: 245.75,
  week: 1823.50,
  month: 7456.20,
  todayRides: 12,
  weekRides: 87,
  monthRides: 342,
  acceptanceRate: 0.89,
  rating: 4.8
};

export const mockRideRequest = {
  id: 'request-001',
  riderId: 'rider-001',
  riderName: 'Alex Thompson',
  riderRating: 4.9,
  pickup: {
    lat: 37.7749,
    lng: -122.4194,
    address: '123 Market St, San Francisco'
  },
  dropoff: {
    lat: 37.7849,
    lng: -122.4094,
    address: '456 Mission St, San Francisco'
  },
  distance: 8.5,
  estimatedDuration: 22,
  offeredFare: 23.56,
  pickupDistance: 0.8, // km from driver
  expiresAt: Date.now() + 15000, // 15 seconds
  vehicleType: 'sedan'
};

// Simulate API delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockAPI = {
  auth: {
    sendOTP: async (phoneNumber) => {
      await delay(1000);
      return { success: true, message: 'OTP sent successfully' };
    },
    verifyOTP: async (phoneNumber, otp) => {
      await delay(1000);
      if (otp === '123456') {
        return {
          success: true,
          user: mockUser,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        };
      }
      throw new Error('Invalid OTP');
    }
  },
  
  rides: {
    estimate: async (pickup, dropoff, vehicleType) => {
      await delay(1500);
      return mockFareEstimate;
    },
    
    create: async (rideData) => {
      await delay(2000);
      return {
        ...mockRide,
        ...rideData,
        id: `ride-${Date.now()}`,
        status: 'searching'
      };
    },
    
    get: async (rideId) => {
      await delay(500);
      return mockRide;
    }
  },
  
  driver: {
    getEarnings: async () => {
      await delay(500);
      return mockDriverEarnings;
    }
  }
};
