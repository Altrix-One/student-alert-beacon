import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, X, Share, Plus, Monitor } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallPrompt = () => {
  const { 
    isInstallable, 
    isInstalled, 
    platform, 
    canInstall, 
    installApp, 
    dismissInstallPrompt, 
    showInstallPrompt 
  } = usePWA();
  
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    dismissInstallPrompt();
  };

  const handleInstall = async () => {
    try {
      await installApp();
      setIsVisible(false);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  // Don't show if already installed or dismissed
  if (!showInstallPrompt || !isVisible || isInstalled || !canInstall) {
    return null;
  }

  // iOS-specific install instructions
  if (platform === 'ios') {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-floating border-primary/20 bg-gradient-card backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Install SafeCampus</CardTitle>
                <CardDescription>Add to your home screen for quick access</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="gap-1">
                <Share className="h-3 w-3" />
                Step 1
              </Badge>
              <span>Tap the Share button in Safari</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="gap-1">
                <Plus className="h-3 w-3" />
                Step 2
              </Badge>
              <span>Select "Add to Home Screen"</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="gap-1">
                <Smartphone className="h-3 w-3" />
                Step 3
              </Badge>
              <span>Tap "Add" to install SafeCampus</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Android/Desktop install prompt
  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-floating border-primary/20 bg-gradient-card backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              {platform === 'desktop' ? (
                <Monitor className="h-6 w-6 text-primary" />
              ) : (
                <Smartphone className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">Install SafeCampus</CardTitle>
              <CardDescription>
                {platform === 'desktop' 
                  ? 'Add to your desktop for quick access'
                  : 'Add to your home screen for quick access'
                }
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Download className="h-3 w-3" />
              Offline Access
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Smartphone className="h-3 w-3" />
              App-like Experience
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Share className="h-3 w-3" />
              Quick Emergency Access
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 gap-2"
              variant="hero"
            >
              <Download className="h-4 w-4" />
              Install App
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};