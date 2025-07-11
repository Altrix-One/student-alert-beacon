import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Download, Smartphone, Monitor, RefreshCw } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { isInstalled, isStandalone, platform } = usePWA();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const getPlatformIcon = () => {
    switch (platform) {
      case 'ios':
        return <Smartphone className="h-4 w-4" />;
      case 'android':
        return <Smartphone className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Smartphone className="h-4 w-4" />;
    }
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'ios':
        return 'iOS';
      case 'android':
        return 'Android';
      case 'desktop':
        return 'Desktop';
      default:
        return 'Web';
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {getPlatformIcon()}
          App Status
        </CardTitle>
        <CardDescription>
          Current app and connectivity status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Installation Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Installation</span>
          <Badge variant={isInstalled ? "default" : "secondary"} className="gap-1">
            {isInstalled ? <Download className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
            {isInstalled ? 'Installed' : 'Web App'}
          </Badge>
        </div>

        {/* Platform */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Platform</span>
          <Badge variant="outline" className="gap-1">
            {getPlatformIcon()}
            {getPlatformName()}
          </Badge>
        </div>

        {/* Standalone Mode */}
        {isInstalled && (
          <div className="flex items-center justify-between">
            <span className="text-sm">Mode</span>
            <Badge variant={isStandalone ? "default" : "secondary"}>
              {isStandalone ? 'Standalone' : 'Browser'}
            </Badge>
          </div>
        )}

        {/* Connectivity */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Connection</span>
          <Badge variant={isOnline ? "default" : "destructive"} className="gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Update Available */}
        {updateAvailable && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Update Available</span>
              <Badge variant="secondary" className="gap-1">
                <RefreshCw className="h-3 w-3" />
                New Version
              </Badge>
            </div>
            <Button
              onClick={handleUpdate}
              size="sm"
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Update App
            </Button>
          </div>
        )}

        {/* Offline Notice */}
        {!isOnline && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              App is working offline. Emergency features remain available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};