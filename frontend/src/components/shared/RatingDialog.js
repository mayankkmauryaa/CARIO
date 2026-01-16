import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/services/api';

const RATING_TAGS = {
  5: ['Excellent', 'Professional', 'Clean', 'On Time', 'Friendly'],
  4: ['Good', 'Courteous', 'Safe Driving', 'Neat'],
  3: ['Average', 'Acceptable', 'OK'],
  2: ['Below Average', 'Late', 'Unprofessional'],
  1: ['Poor', 'Unsafe', 'Rude', 'Very Late', 'Unclean']
};

export const RatingDialog = ({ isOpen, onClose, rideId, driverName, driverPhoto }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.rides.rate(rideId, rating, {
        tags: selectedTags,
        text: review
      });
      toast.success('Thank you for your feedback!');
      onClose();
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const displayRating = hoveredRating || rating;
  const availableTags = displayRating > 0 ? RATING_TAGS[displayRating] || [] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rate Your Ride</DialogTitle>
          <DialogDescription>
            How was your experience with {driverName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Driver Info */}
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold text-muted-foreground">
              {driverName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-lg">{driverName}</p>
              <p className="text-sm text-muted-foreground">Your driver</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 transition-colors ${star <= displayRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-none text-muted-foreground'
                      }`}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p className="text-sm font-medium">
                {['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'][displayRating]}
              </p>
            )}
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">What stood out?</p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Written Review */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Additional Comments (Optional)
            </label>
            <Textarea
              placeholder="Share your experience..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="w-full h-12 text-base font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
