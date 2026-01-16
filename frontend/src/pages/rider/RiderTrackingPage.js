import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, Navigation2, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import MapMock from '@/components/shared/MapMock';
import SOSButton from '@/components/shared/SOSButton';
import RatingDialog from '@/components/shared/RatingDialog';
import { useRideStore } from '@/store/rideStore';
import { mockDriver } from '@/services/mockData';
import wsService from '@/services/websocket';

const STATUS_CONFIG = {
  searching: { text: 'Finding drivers...', progress: 20, color: 'text-primary' },
  driver_assigned: { text: 'Driver on the way', progress: 40, color: 'text-primary' },
  driver_arrived: { text: 'Driver arrived', progress: 60, color: 'text-success' },
  in_ride: { text: 'On your way', progress: 80, color: 'text-success' },
  completed: { text: 'Trip completed', progress: 100, color: 'text-success' }
};

export const RiderTrackingPage = () => {
  const navigate = useNavigate();
  const { currentRide, rideStatus, driver, driverLocation, eta, setDriver, updateRideStatus } = useRideStore();
  
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [simulatedLocation, setSimulatedLocation] = useState(null);

  useEffect(() => {
    if (!currentRide) {
      navigate('/rider');
      return;
    }

    // Simulate ride progression for demo
    simulateRideFlow();

    return () => {
      wsService.disconnect();
    };
  }, [currentRide]);

  const simulateRideFlow = async () => {
    // Simulate searching -> driver assigned
    setTimeout(() => {
      setDriver(mockDriver);
      updateRideStatus('driver_assigned');
      toast.success('Driver assigned!');
      
      // Simulate driver location updates
      const locationInterval = setInterval(() => {
        setSimulatedLocation({
          lat: mockDriver.location.lat + (Math.random() - 0.5) * 0.01,
          lng: mockDriver.location.lng + (Math.random() - 0.5) * 0.01
        });
      }, 2000);

      // Simulate driver arrived
      setTimeout(() => {
        updateRideStatus('driver_arrived');
        toast.info('Driver has arrived at pickup location');
        clearInterval(locationInterval);
      }, 8000);

      // Simulate ride start
      setTimeout(() => {
        updateRideStatus('in_ride');
        toast.info('Ride started');
      }, 12000);

      // Simulate ride complete
      setTimeout(() => {
        updateRideStatus('completed');
        setShowRatingDialog(true);
      }, 20000);
    }, 3000);
  };

  const handleCancelRide = () => {
    if (window.confirm('Are you sure you want to cancel this ride?')) {
      updateRideStatus('cancelled_by_rider');
      toast.info('Ride cancelled');
      navigate('/rider');
    }
  };

  const handleRatingClose = () => {
    setShowRatingDialog(false);
    navigate('/rider');
  };

  const statusConfig = STATUS_CONFIG[rideStatus] || STATUS_CONFIG.searching;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Map */}
      <div className="flex-1 relative">
        <MapMock
          pickup={currentRide?.pickup}
          dropoff={currentRide?.dropoff}
          driverLocation={simulatedLocation || driver?.location}
          className="h-full"
        />

        {/* SOS Button */}
        <SOSButton
          rideId={currentRide?.id}
          currentLocation={currentRide?.pickup}
        />
      </div>

      {/* Bottom Sheet */}
      <div className="bg-card border-t border-border rounded-t-3xl shadow-2xl">
        {/* Status Bar */}
        <div className="px-6 pt-6 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${statusConfig.color}`}>
              {statusConfig.text}
            </h2>
            {eta && (
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {eta} min
              </Badge>
            )}
          </div>
          <Progress value={statusConfig.progress} className="h-2" />
        </div>

        {/* Driver Info (when assigned) */}
        {driver && rideStatus !== 'searching' && (
          <Card className="mx-6 mb-4 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-lg">
                    {driver.fullName?.charAt(0)}
                  </div>
                </Avatar>
                
                <div className="flex-1">
                  <p className="font-semibold text-lg">{driver.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {driver.vehicleModel}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      ⭐ {driver.rating}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {driver.vehicleNumber}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="rounded-full">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="rounded-full">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trip Details */}
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pickup</p>
                <p className="font-medium">{currentRide?.pickup?.address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-destructive mt-1.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Dropoff</p>
                <p className="font-medium">{currentRide?.dropoff?.address}</p>
              </div>
            </div>
          </div>

          {/* Fare */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <span className="text-sm font-medium">Trip Fare</span>
            <span className="text-xl font-bold text-primary">
              ${currentRide?.offeredFare?.toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          {['searching', 'driver_assigned'].includes(rideStatus) && (
            <Button
              onClick={handleCancelRide}
              variant="outline"
              className="w-full h-12"
            >
              Cancel Ride
            </Button>
          )}

          {rideStatus === 'driver_arrived' && (
            <div className="p-4 rounded-lg bg-success/10 text-success text-center font-medium">
              Your driver is waiting at the pickup location
            </div>
          )}
        </div>
      </div>

      {/* Rating Dialog */}
      {showRatingDialog && (
        <RatingDialog
          isOpen={showRatingDialog}
          onClose={handleRatingClose}
          rideId={currentRide?.id}
          driverName={driver?.fullName || 'Driver'}
        />
      )}
    </div>
  );
};

export default RiderTrackingPage;
