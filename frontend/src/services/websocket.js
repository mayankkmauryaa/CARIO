import { useAuthStore } from '../store/authStore';
import { useRideStore } from '../store/rideStore';
import { useDriverStore } from '../store/driverStore';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = {};
    this.isConnecting = false;
  }

  connect(rideId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('WebSocket connection in progress');
      return;
    }

    const token = useAuthStore.getState().token;
    if (!token) {
      console.error('No auth token available for WebSocket connection');
      return;
    }

    this.isConnecting = true;
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const wsUrl = BACKEND_URL.replace(/^http/, 'ws');
    const url = `${wsUrl}/ws/rides/${rideId}/track?token=${token}`;

    console.log('Connecting to WebSocket:', url);

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.emit('connected', { rideId });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.isConnecting = false;
      this.emit('disconnected');
      this.attemptReconnect(rideId);
    };
  }

  handleMessage(data) {
    const { event, payload } = data;

    switch (event) {
      case 'driver_location_update':
        useRideStore.getState().updateDriverLocation(payload.location);
        this.emit('driver_location', payload);
        break;

      case 'eta_update':
        useRideStore.getState().updateETA(payload.eta);
        this.emit('eta_update', payload);
        break;

      case 'ride_state_change':
        useRideStore.getState().updateRideStatus(payload.status);
        this.emit('ride_state_change', payload);
        break;

      case 'driver_assigned':
        useRideStore.getState().setDriver(payload.driver);
        this.emit('driver_assigned', payload);
        break;

      case 'driver_arrived':
        this.emit('driver_arrived', payload);
        break;

      case 'ride_started':
        useRideStore.getState().updateRideStatus('in_ride');
        this.emit('ride_started', payload);
        break;

      case 'ride_completed':
        useRideStore.getState().updateRideStatus('completed');
        this.emit('ride_completed', payload);
        break;

      case 'ride_cancelled':
        useRideStore.getState().updateRideStatus(payload.cancelledBy === 'rider' ? 'cancelled_by_rider' : 'cancelled_by_driver');
        this.emit('ride_cancelled', payload);
        break;

      case 'ride_request':
        // For drivers
        useDriverStore.getState().addRideRequest(payload);
        this.emit('ride_request', payload);
        break;

      default:
        console.warn('Unknown WebSocket event:', event);
    }
  }

  send(event, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  attemptReconnect(rideId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(rideId);
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners = {};
    this.reconnectAttempts = 0;
  }
}

// Singleton instance
const wsService = new WebSocketService();
export default wsService;
