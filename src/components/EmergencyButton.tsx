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
    <div className="flex flex-col items-center space-y-4">
      <Button
        variant="emergency"
        size="emergency"
        onClick={handleEmergencyPress}
        disabled={isLoading}
        className={isLoading ? "animate-emergency-pulse" : "hover:scale-110"}
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
      
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Emergency Button</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Press and hold to send an emergency alert with your location to your emergency contacts
        </p>
        <div className="flex items-center justify-center gap-1 text-xs text-primary">
          <MapPin className="h-3 w-3" />
          <span>Location tracking enabled</span>
        </div>
      </div>
    </div>
  );
};