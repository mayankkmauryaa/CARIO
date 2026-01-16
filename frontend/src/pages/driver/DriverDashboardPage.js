import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Power, DollarSign, TrendingUp, Star, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useDriverStore } from '@/store/driverStore';
import { useAuthStore } from '@/store/authStore';
import { mockDriverEarnings, mockRideRequest } from '@/services/mockData';
import MapMock from '@/components/shared/MapMock';

export const DriverDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {isOnline, toggleOnline, activeRide, currentLocation } = useDriverStore();
  const [earnings, setEarnings] = useState(mockDriverEarnings);
  const [rideRequest, setRideRequest] = useState(null);
  const [requestTimer, setRequestTimer] = useState(15);

  useEffect(() => {
    // Simulate ride request when online
    if (isOnline && !activeRide && !rideRequest) {
      const timeout = setTimeout(() => {
        setRideRequest(mockRideRequest);
        toast.info('New ride request!');
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isOnline, activeRide, rideRequest]);

  useEffect(() => {
    if (!rideRequest) return;

    const interval = setInterval(() => {
      setRequestTimer((prev) => {
        if (prev <= 1) {
          setRideRequest(null);
          toast.error('Ride request expired');
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rideRequest]);

  const handleToggleOnline = () => {
    toggleOnline();
    toast.success(isOnline ? 'You are now offline' : 'You are now online');
  };

  const handleAcceptRide = () => {
    toast.success('Ride accepted!');
    navigate('/driver/active-ride');
  };

  const handleRejectRide = () => {
    setRideRequest(null);
    setRequestTimer(15);
    toast.info('Ride request declined');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CARIO Driver
              </h1>
              <p className="text-sm text-muted-foreground">
                {user?.fullName || 'Driver'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`text-sm font-medium ${isOnline ? 'text-success' : 'text-muted-foreground'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <Switch
                checked={isOnline}
                onCheckedChange={handleToggleOnline}
                className="data-[state=checked]:bg-success"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Map View (when online) */}
      {isOnline && (
        <div className="h-64">
          <MapMock
            driverLocation={currentLocation || { lat: 37.7749, lng: -122.4194 }}
            showControls={false}
            className="h-full"
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Earnings Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Today</span>
                <DollarSign className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-success">
                ${earnings.today.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {earnings.todayRides} rides
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week</span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">
                ${earnings.week.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {earnings.weekRides} rides
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Acceptance Rate</span>
                <span className="font-semibold">{(earnings.acceptanceRate * 100).toFixed(0)}%</span>
              </div>
              <Progress value={earnings.acceptanceRate * 100} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rating</span>
              <Badge className="gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {earnings.rating}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Rides</span>
              <span className="font-semibold">{earnings.monthRides}</span>
            </div>
          </CardContent>
        </Card>

        {/* Offline Message */}
        {!isOnline && (
          <Card className="border-primary/20">
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Power className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">You're Offline</p>
                <p className="text-sm text-muted-foreground">
                  Turn on to start receiving ride requests
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ride Request Modal */}
      {rideRequest && (
        <div className="fixed inset-0 bg-background/95 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-lg shadow-2xl animate-fade-in">
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">New Ride Request</h3>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  {requestTimer}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Pickup</p>
                    <p className="font-medium">{rideRequest.pickup.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rideRequest.pickupDistance} km away
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      ${rideRequest.offeredFare.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Fare</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {rideRequest.distance}
                    </p>
                    <p className="text-xs text-muted-foreground">km</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {rideRequest.estimatedDuration}
                    </p>
                    <p className="text-xs text-muted-foreground">min</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="font-semibold">{rideRequest.riderName?.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{rideRequest.riderName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {rideRequest.riderRating}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleRejectRide}
                  variant="outline"
                  className="h-12 text-base"
                >
                  Decline
                </Button>
                <Button
                  onClick={handleAcceptRide}
                  className="h-12 text-base font-semibold"
                >
                  Accept
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <Button variant="ghost" className="flex-col gap-1 h-auto py-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-xs text-primary">Home</span>
            </Button>
            <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => navigate('/driver/earnings')}>
              <DollarSign className="w-5 h-5" />
              <span className="text-xs">Earnings</span>
            </Button>
            <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => navigate('/driver/profile')}>
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs">{user?.fullName?.charAt(0)}</span>
              </div>
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default DriverDashboardPage;
