import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Geolocation } from '@capacitor/geolocation';

interface EmergencyButtonProps {
  onEmergencyTriggered: (location: { lat: number; lng: number }) => void;
}

export const EmergencyButton = ({ onEmergencyTriggered }: EmergencyButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEmergencyPress = async () => {
    setIsLoading(true);
    
    try {
      // Get current location
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const location = {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
      };

      onEmergencyTriggered(location);
      
      toast({
        title: "Emergency Alert Sent!",
        description: "Your emergency contacts have been notified with your current location.",
      });
      
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: "Location Error",
        description: "Could not get your location. Emergency alert sent without coordinates.",
        variant: "destructive",
      });
      
      // Still trigger emergency even without location
      onEmergencyTriggered({ lat: 0, lng: 0 });
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
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