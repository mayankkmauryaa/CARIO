import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { user, setRole } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(user?.role || null);

  const roles = [
    {
      id: 'rider',
      title: 'Rider',
      description: 'Book rides and travel',
      icon: User,
      features: ['Compare fares', 'Real-time tracking', 'Safe rides']
    },
    {
      id: 'driver',
      title: 'Driver',
      description: 'Earn by driving',
      icon: Car,
      features: ['Flexible hours', 'Fair earnings', 'Easy payouts']
    },
    {
      id: 'both',
      title: 'Both',
      description: 'Ride and drive',
      icon: Users,
      features: ['Complete flexibility', 'Switch anytime', 'Best of both']
    }
  ];

  const handleContinue = () => {
    if (!selectedRole) {
      toast.error('Please select a role to continue');
      return;
    }

    setRole(selectedRole);
    toast.success(`Welcome as ${selectedRole === 'both' ? 'Rider & Driver' : selectedRole}!`);
    
    // Navigate based on role
    if (selectedRole === 'rider' || selectedRole === 'both') {
      navigate('/rider');
    } else {
      navigate('/driver');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Choose Your Role</h1>
          <p className="text-muted-foreground text-lg">
            How would you like to use CARIO?
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected
                    ? 'border-primary shadow-md ring-2 ring-primary ring-offset-2'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardContent className="p-6 space-y-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{role.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li
                        key={index}
                        className="text-sm flex items-center gap-2"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-primary' : 'bg-muted-foreground'
                          }`}
                        />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="min-w-[200px] h-12 text-base font-medium"
          >
            Continue
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          You can always switch your role later from settings
        </p>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
