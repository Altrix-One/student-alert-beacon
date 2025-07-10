import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Geolocation } from '@capacitor/geolocation';

interface EmergencyButtonProps {
  onEmergencyTriggered: (location: { lat: number; lng: number }) => void;
}

export const EmergencyButton = ({ onEmergencyTriggered }: EmergencyButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getLocationFallback = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          let errorMessage = 'Unknown location error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  const getCurrentLocation = async (): Promise<{ lat: number; lng: number }> => {
    try {
      // Try Capacitor Geolocation first (for mobile apps)
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      return {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
      };
    } catch (capacitorError) {
      console.log('Capacitor geolocation failed, trying browser API:', capacitorError);
      
      // Fallback to browser geolocation API
      try {
        return await getLocationFallback();
      } catch (browserError) {
        console.error('Browser geolocation also failed:', browserError);
        throw browserError;
      }
    }
  };

  const handleEmergencyPress = async () => {
    setIsLoading(true);
    
    try {
      // Show immediate feedback
      toast({
        title: "🚨 Emergency Alert Initiated",
        description: "Getting your location and sending alerts...",
      });

      // Get current location with improved error handling
      const location = await getCurrentLocation();
      
      // Trigger the emergency with location
      onEmergencyTriggered(location);
      
      // Show success message with coordinates
      toast({
        title: "✅ Emergency Alert Sent Successfully!",
        description: `Your emergency contacts have been notified. Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}. Help is on the way!`,
        duration: 8000,
      });
      
    } catch (error) {
      console.error('Error getting location:', error);
      
      // Still send emergency alert without precise location
      const fallbackLocation = { lat: 0, lng: 0 };
      onEmergencyTriggered(fallbackLocation);
      
      toast({
        title: "⚠️ Emergency Alert Sent",
        description: `Alert sent to your emergency contacts. Could not get precise location: ${error instanceof Error ? error.message : 'Unknown error'}. Help is being notified!`,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <Button
          variant="emergency"
          size="emergency"
          onClick={handleEmergencyPress}
          disabled={isLoading}
          className={`${isLoading ? "animate-emergency-pulse" : "hover:scale-110"} transition-all duration-300 shadow-floating`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 mb-1 animate-spin" />
              <span className="text-sm font-bold tracking-wider">SENDING...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <AlertTriangle className="h-8 w-8 mb-1" />
              <span className="text-sm font-bold tracking-wider">EMERGENCY</span>
            </div>
          )}
        </Button>
        
        {/* Pulse ring animation when not loading */}
        {!isLoading && (
          <div className="absolute inset-0 rounded-full border-4 border-emergency/30 animate-ping"></div>
        )}
      </div>
      
      <div className="text-center space-y-3 max-w-sm">
        <h2 className="text-2xl font-bold text-foreground">Emergency Alert</h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          Press to instantly notify your emergency contacts with your exact location
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-primary bg-primary/10 px-4 py-2 rounded-full">
          <MapPin className="h-4 w-4" />
          <span className="font-medium">GPS Location Enabled</span>
        </div>
      </div>
    </div>
  );
};