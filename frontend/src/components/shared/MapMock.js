import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export const MapMock = ({
  pickup,
  dropoff,
  driverLocation,
  route,
  className = '',
  showControls = true
}) => {
  const [animatedDriver, setAnimatedDriver] = useState(driverLocation);
  const canvasRef = useRef(null);

  // Animate driver movement
  useEffect(() => {
    if (!driverLocation) return;

    const animate = () => {
      setAnimatedDriver(prev => {
        if (!prev) return driverLocation;
        // Simple lerp animation
        return {
          lat: prev.lat + (driverLocation.lat - prev.lat) * 0.1,
          lng: prev.lng + (driverLocation.lng - prev.lng) * 0.1
        };
      });
    };

    const interval = setInterval(animate, 100);
    return () => clearInterval(interval);
  }, [driverLocation]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid background
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Helper to convert lat/lng to canvas coords
    const toCanvas = (point) => {
      if (!point) return null;
      // Simple mapping - in production, use proper map projection
      return {
        x: (point.lng + 122.5) * width / 0.2,
        y: (37.85 - point.lat) * height / 0.2
      };
    };

    // Draw route
    if (route && route.length > 1) {
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      route.forEach((point, i) => {
        const pos = toCanvas(point);
        if (pos) {
          if (i === 0) ctx.moveTo(pos.x, pos.y);
          else ctx.lineTo(pos.x, pos.y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (pickup && dropoff) {
      // Draw simple route line
      const startPos = toCanvas(pickup);
      const endPos = toCanvas(dropoff);
      if (startPos && endPos) {
        ctx.strokeStyle = 'hsl(var(--primary))';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw pickup marker
    if (pickup) {
      const pos = toCanvas(pickup);
      if (pos) {
        // Pin shape
        ctx.fillStyle = 'hsl(var(--primary))';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // Draw dropoff marker
    if (dropoff) {
      const pos = toCanvas(dropoff);
      if (pos) {
        // Square marker
        ctx.fillStyle = 'hsl(var(--destructive))';
        ctx.fillRect(pos.x - 8, pos.y - 8, 16, 16);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.strokeRect(pos.x - 8, pos.y - 8, 16, 16);
      }
    }

    // Draw driver location
    if (animatedDriver) {
      const pos = toCanvas(animatedDriver);
      if (pos) {
        // Car icon (simplified)
        ctx.fillStyle = 'hsl(var(--success))';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pulse effect
        ctx.strokeStyle = 'hsl(var(--success) / 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [pickup, dropoff, animatedDriver, route]);

  return (
    <div className={`relative map-container ${className}`}>
      {/* Canvas for drawing */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Map overlays */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        {/* Legend */}
        <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-md p-3 space-y-2 pointer-events-auto">
          {pickup && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-primary border-2 border-white" />
              <span className="text-muted-foreground">Pickup</span>
            </div>
          )}
          {dropoff && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-destructive border-2 border-white" />
              <span className="text-muted-foreground">Dropoff</span>
            </div>
          )}
          {driverLocation && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-success border-2 border-white" />
              <span className="text-muted-foreground">Driver</span>
            </div>
          )}
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button className="w-10 h-10 rounded-lg bg-card shadow-md flex items-center justify-center hover:bg-accent transition-colors">
              <Navigation className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-lg bg-card shadow-md flex items-center justify-center hover:bg-accent transition-colors">
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Mock attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-card/80 px-2 py-1 rounded">
        Mapbox Preview
      </div>
    </div>
  );
};

export default MapMock;
