import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Clock, Home as HomeIcon, Briefcase, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MapMock from '@/components/shared/MapMock';
import { useRideStore } from '@/store/rideStore';
import { useAuthStore } from '@/store/authStore';
import { mockSavedLocations, mockRideHistory } from '@/services/mockData';

export const RiderHomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setPickup, setDropoff, pickup, dropoff } = useRideStore();
  
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  const [currentLocation, setCurrentLocation] = useState({ lat: 37.7749, lng: -122.4194 });

  useEffect(() => {
    // Simulate getting current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Geolocation error:', error)
      );
    }
  }, []);

  const handleLocationSelect = (location, type) => {
    if (type === 'pickup') {
      setPickup(location);
      setPickupText(location.address);
    } else {
      setDropoff(location);
      setDropoffText(location.address);
    }
  };

  const handleSearchRide = () => {
    if (!pickup || !dropoff) {
      return;
    }
    navigate('/rider/booking');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CARIO
              </h1>
              <p className="text-sm text-muted-foreground">
                Hello, {user?.fullName || 'Rider'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate('/rider/profile')}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Where to?</h2>
            
            {/* Pickup Input */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <Input
                placeholder="Pickup location"
                value={pickupText}
                onChange={(e) => setPickupText(e.target.value)}
                onFocus={() => {}}
                className="pl-10 h-12"
              />
            </div>

            {/* Dropoff Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
              <Input
                placeholder="Where to?"
                value={dropoffText}
                onChange={(e) => setDropoffText(e.target.value)}
                onFocus={() => {}}
                className="pl-10 h-12"
              />
            </div>

            <Button
              onClick={handleSearchRide}
              disabled={!pickup || !dropoff}
              className="w-full h-12 text-base font-medium"
            >
              Search Rides
            </Button>
          </CardContent>
        </Card>

        {/* Saved Locations */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground px-1">
            SAVED PLACES
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {mockSavedLocations.map((location) => (
              <Card
                key={location.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleLocationSelect(location, 'dropoff')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {location.icon === 'home' ? (
                      <HomeIcon className="w-5 h-5 text-primary" />
                    ) : (
                      <Briefcase className="w-5 h-5 text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{location.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {location.address.split(',')[0]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs for Rides & Activity */}
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recent Rides</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-3 mt-4">
            {mockRideHistory.slice(0, 3).map((ride) => (
              <Card key={ride.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <p className="font-medium text-sm">{ride.pickup}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{ride.dropoff}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ride.date}
                        </span>
                        <span>${ride.fare}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {ride.rating}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-3 mt-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Popular Route</p>
                  <p className="text-xs text-muted-foreground">
                    Home → Work • Save 20% during off-peak
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => navigate('/rider')}>
              <HomeIcon className="w-5 h-5 text-primary" />
              <span className="text-xs text-primary">Home</span>
            </Button>
            <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => navigate('/rider/activity')}>
              <Clock className="w-5 h-5" />
              <span className="text-xs">Activity</span>
            </Button>
            <Button variant="ghost" className="flex-col gap-1 h-auto py-2" onClick={() => navigate('/rider/profile')}>
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

export default RiderHomePage;
