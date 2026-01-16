import React, { useState } from 'react';
import { AlertCircle, Phone, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/services/api';

export const SOSButton = ({ rideId, currentLocation, variant = 'floating' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTriggerSOS = async () => {
    setIsTriggering(true);
    try {
      await api.safety.triggerSOS(rideId, currentLocation);
      toast.success('Emergency services have been notified');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to trigger SOS. Please call 911 directly.');
    } finally {
      setIsTriggering(false);
    }
  };

  const handleCall911 = () => {
    window.location.href = 'tel:911';
  };

  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center animate-pulse-slow"
          aria-label="Emergency SOS"
        >
          <AlertCircle className="w-8 h-8" />
        </button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Emergency SOS
              </DialogTitle>
              <DialogDescription>
                This will immediately alert emergency contacts and CARIO support team
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <Button
                onClick={handleTriggerSOS}
                disabled={isTriggering}
                variant="destructive"
                className="w-full h-12 text-base font-semibold"
              >
                {isTriggering ? 'Alerting...' : 'Trigger SOS Alert'}
              </Button>

              <Button
                onClick={handleCall911}
                variant="outline"
                className="w-full h-12 text-base"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call 911 Directly
              </Button>

              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="w-full"
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Your location and ride details will be shared with emergency services
            </p>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Inline variant
  return (
    <Button
      onClick={() => setIsOpen(true)}
      variant="destructive"
      size="sm"
      className="gap-2"
    >
      <AlertCircle className="w-4 h-4" />
      SOS
    </Button>
  );
};

export default SOSButton;
