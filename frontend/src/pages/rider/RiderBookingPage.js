import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Zap } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Slider } from '../../components/ui/slider';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';
import { useRideStore } from '../../store/rideStore';
import { mockAPI, mockFareEstimate } from '../../services/mockData';

const VEHICLE_TYPES = [
  { id: 'mini', name: 'Mini', icon: '🚗', capacity: 4, desc: 'Affordable' },
  { id: 'sedan', name: 'Sedan', icon: '🚙', capacity: 4, desc: 'Comfortable' },
  { id: 'suv', name: 'SUV', icon: '🚐', capacity: 6, desc: 'Spacious' }
];

export const RiderBookingPage = () => {
  const navigate = useNavigate();
  const { pickup, dropoff, vehicleType, setVehicleType, setFareEstimate, setOfferedFare, setCurrentRide, fareEstimate, offeredFare } = useRideStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [customFare, setCustomFare] = useState([23.56]);

  useEffect(() => {
    if (!pickup || !dropoff) {
      navigate('/rider');
      return;
    }
    fetchEstimate();
  }, [pickup, dropoff, vehicleType]);

  const fetchEstimate = async () => {
    setIsLoading(true);
    try {
      const result = await mockAPI.rides.estimate(pickup, dropoff, vehicleType);
      setEstimate(result);
      setFareEstimate(result);
      setCustomFare([result.recommendedFare]);
      setOfferedFare(result.recommendedFare);
    } catch (error) {
      toast.error('Failed to fetch fare estimate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookRide = async () => {
    if (customFare[0] < estimate.minimumFare) {
      toast.error('Fare cannot be below minimum driver earnings');
      return;
    }

    setIsBooking(true);
    try {
      const ride = await mockAPI.rides.create({
        pickup,
        dropoff,
        vehicleType,
        offeredFare: customFare[0],
        distance: estimate.distance,
        estimatedDuration: estimate.estimatedDuration
      });
      
      setCurrentRide(ride);
      setOfferedFare(customFare[0]);
      toast.success('Searching for drivers...');
      navigate('/rider/tracking');
    } catch (error) {
      toast.error('Failed to create ride');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading || !estimate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Calculating fare...</p>
        </div>
      </div>
    );
  }

  const isBelowMinimum = customFare[0] < estimate.minimumFare;
  const discount = estimate.recommendedFare - customFare[0];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold">Confirm Ride</h1>
            <p className="text-sm text-muted-foreground">{estimate.distance} km • {estimate.estimatedDuration} min</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Vehicle Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">CHOOSE VEHICLE</h3>
          <div className="grid gap-3">
            {VEHICLE_TYPES.map((vehicle) => (
              <Card
                key={vehicle.id}
                className={`cursor-pointer transition-all ${
                  vehicleType === vehicle.id
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setVehicleType(vehicle.id)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-3xl">{vehicle.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold">{vehicle.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      {vehicle.capacity} seats • {vehicle.desc}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary">${estimate.recommendedFare.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Fare Customization - FlexFare */}
        <Card className="border-primary/20 shadow-md">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">FlexFare™</h3>
                <p className="text-sm text-muted-foreground">Customize your fare</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" />
                Smart
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your Fare</span>
                <span className="text-2xl font-bold text-primary">
                  ${customFare[0].toFixed(2)}
                </span>
              </div>

              <Slider
                value={customFare}
                onValueChange={setCustomFare}
                min={estimate.minimumFare}
                max={estimate.recommendedFare * 1.5}
                step={0.50}
                className="w-full"
              />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Min: ${estimate.minimumFare.toFixed(2)}</span>
                <span>Recommended: ${estimate.recommendedFare.toFixed(2)}</span>
              </div>

              {isBelowMinimum && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  Fare below minimum driver earnings. Please adjust.
                </div>
              )}

              {!isBelowMinimum && discount > 0 && (
                <div className="p-3 rounded-lg bg-success/10 text-success text-sm">
                  You're saving ${discount.toFixed(2)} from recommended fare!
                </div>
              )}
            </div>

            <Separator />

            {/* Fare Breakdown */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Fare Breakdown</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span>${estimate.baseFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance ({estimate.distance} km)</span>
                  <span>${estimate.distanceCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time ({estimate.estimatedDuration} min)</span>
                  <span>${estimate.timeCost.toFixed(2)}</span>
                </div>
                {estimate.surgeMultiplier > 1 && (
                  <div className="flex justify-between text-warning">
                    <span>Surge ({estimate.surgeMultiplier}x)</span>
                    <span>+${((estimate.surgeMultiplier - 1) * estimate.baseFare).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>${estimate.platformFee.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Book Button */}
        <Button
          onClick={handleBookRide}
          disabled={isBooking || isBelowMinimum}
          className="w-full h-14 text-lg font-semibold"
        >
          {isBooking ? 'Booking...' : `Book Ride - $${customFare[0].toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
};

export default RiderBookingPage;
