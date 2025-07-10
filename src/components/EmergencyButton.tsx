import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Geolocation } from '@capacitor/geolocation';

interface EmergencyLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface EmergencyButtonProps {
  onEmergencyTriggered: (location: EmergencyLocation) => void;
  onEmergencyReset?: () => void;
  residence?: any; // StudentResidence type
}

export const EmergencyButton = ({ onEmergencyTriggered, onEmergencyReset, residence }: EmergencyButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const { toast } = useToast();

  // Debug function to check if button is working
  const handleButtonClick = () => {
    console.log('Emergency button clicked! Current state:', { isLoading, isRequested });
    
    if (isRequested) {
      // Reset the emergency state
      handleResetEmergency();
    } else {
      // Trigger emergency
      handleEmergencyPress();
    }
  };

  const handleResetEmergency = () => {
    setIsRequested(false);
    onEmergencyReset?.(); // Call the reset callback
    toast({
      title: "Emergency Request Cancelled",
      description: "Emergency status has been reset. You can request help again if needed.",
      duration: 3000,
    });
    console.log('Emergency state reset');
  };

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
      
      // Enhance location with residence information if available
      const enhancedLocation: EmergencyLocation = {
        ...location,
        address: residence ? `${residence.residenceName}, ${residence.streetAddress}${residence.unitRoomNumber ? `, ${residence.unitRoomNumber}` : ''}, ${residence.city}, ${residence.stateProvince}` : undefined
      };
      
      // Trigger the emergency with location
      onEmergencyTriggered(enhancedLocation);
      
      // Set button to requested state
      setIsRequested(true);
      
      // Show success message with coordinates
      const locationText = residence 
        ? `${residence.residenceName} (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`
        : `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
        
      toast({
        title: "✅ Emergency Alert Sent Successfully!",
        description: `Your emergency contacts have been notified. Location: ${locationText}. Help is on the way! Press the button again to cancel the request.`,
        duration: 8000,
      });
      
    } catch (error) {
      console.error('Error getting location:', error);
      
      // Still send emergency alert without precise location
      const fallbackLocation: EmergencyLocation = { 
        lat: 0, 
        lng: 0,
        address: residence ? `${residence.residenceName}, ${residence.streetAddress}${residence.unitRoomNumber ? `, ${residence.unitRoomNumber}` : ''}, ${residence.city}, ${residence.stateProvince}` : undefined
      };
      onEmergencyTriggered(fallbackLocation);
      
      // Set button to requested state even with location error
      setIsRequested(true);
      
      const fallbackLocationText = residence 
        ? `${residence.residenceName} (GPS unavailable)`
        : 'GPS unavailable';
        
      toast({
        title: "⚠️ Emergency Alert Sent",
        description: `Alert sent to your emergency contacts. Location: ${fallbackLocationText}. Could not get precise GPS: ${error instanceof Error ? error.message : 'Unknown error'}. Help is being notified! Press the button again to cancel the request.`,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button appearance based on state
  const getButtonVariant = () => {
    if (isRequested) return "default"; // Green success state
    return "emergency"; // Red emergency state
  };

  const getButtonClassName = () => {
    const baseClasses = "transition-all duration-300 shadow-floating cursor-pointer relative z-10";
    
    if (isLoading) {
      return `${baseClasses} animate-emergency-pulse`;
    }
    
    if (isRequested) {
      return `${baseClasses} bg-green-500 hover:bg-green-600 text-white border-green-500 hover:scale-105 shadow-green-500/30`;
    }
    
    return `${baseClasses} hover:scale-110`;
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <Button
          variant={getButtonVariant()}
          size="emergency"
          onClick={handleButtonClick}
          disabled={isLoading}
          className={getButtonClassName()}
          type="button"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 mb-1 animate-spin" />
              <span className="text-sm font-bold tracking-wider">SENDING...</span>
            </div>
          ) : isRequested ? (
            <div className="flex flex-col items-center justify-center">
              <CheckCircle className="h-8 w-8 mb-1" />
              <span className="text-sm font-bold tracking-wider">REQUESTED</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <AlertTriangle className="h-8 w-8 mb-1" />
              <span className="text-sm font-bold tracking-wider">EMERGENCY</span>
            </div>
          )}
        </Button>
        
        {/* Pulse ring animation - different colors based on state */}
        {!isLoading && (
          <div className={`absolute inset-0 rounded-full border-4 animate-ping ${
            isRequested 
              ? "border-green-500/30" 
              : "border-emergency/30"
          }`}></div>
        )}
      </div>
      
      <div className="text-center space-y-3 max-w-sm">
        <h2 className="text-2xl font-bold text-foreground">
          {isRequested ? "Emergency Requested" : "Emergency Alert"}
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          {isRequested 
            ? "Your emergency request is active. Press the button again to cancel the request."
            : "Press to instantly notify your emergency contacts with your exact location"
          }
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-primary bg-primary/10 px-4 py-2 rounded-full">
          <MapPin className="h-4 w-4" />
          <span className="font-medium">
            {isRequested 
              ? (residence ? `${residence.residenceName} Shared` : "Location Shared")
              : (residence ? `${residence.residenceName} Ready` : "GPS Location Enabled")
            }
          </span>
        </div>
        
        {/* Status indicator */}
        {isRequested && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Help is on the way</span>
          </div>
        )}
      </div>
    </div>
  );
};