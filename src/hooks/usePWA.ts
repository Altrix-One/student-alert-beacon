import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallationState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  canInstall: boolean;
  installApp: () => Promise<void>;
  dismissInstallPrompt: () => void;
  showInstallPrompt: boolean;
}

export const usePWA = (): PWAInstallationState => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Detect platform
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isDesktop = !isIOS && !isAndroid;

      if (isIOS) {
        setPlatform('ios');
      } else if (isAndroid) {
        setPlatform('android');
      } else if (isDesktop) {
        setPlatform('desktop');
      }

      return { isIOS, isAndroid, isDesktop };
    };

    const { isIOS, isAndroid, isDesktop } = detectPlatform();

    // Check if app is already installed/standalone
    const checkInstallationStatus = () => {
      // Check for standalone mode (PWA installed)
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInstalled = isStandaloneMode || isInWebAppiOS;

      setIsStandalone(isStandaloneMode || isInWebAppiOS);
      setIsInstalled(isInstalled);

      return isInstalled;
    };

    const isCurrentlyInstalled = checkInstallationStatus();

    // Request location permissions for better emergency response
    const requestLocationPermission = async () => {
      if ('geolocation' in navigator) {
        try {
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve, 
              reject, 
              {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 300000
              }
            );
          });
          console.log('[PWA] Location permission granted');
        } catch (error) {
          console.log('[PWA] Location permission denied or unavailable:', error);
        }
      }
    };

    // Register service worker with enhanced error handling
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          console.log('[PWA] Service Worker registered successfully:', registration);

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New service worker available');
                  // Optionally show update notification
                }
              });
            }
          });

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

        } catch (error) {
          console.error('[PWA] Service Worker registration failed:', error);
        }
      }
    };

    // iOS-specific installation detection
    const handleIOSInstallation = () => {
      if (isIOS && !isCurrentlyInstalled) {
        // Show iOS install instructions after a delay
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    // Android/Desktop installation prompt handling
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      
      // Show install prompt after user has used the app briefly
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000);
    };

    // App installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Visibility change handling for better UX
    const handleVisibilityChange = () => {
      if (!document.hidden && isCurrentlyInstalled) {
        // App became visible and is installed
        console.log('[PWA] App resumed in standalone mode');
      }
    };

    // Initialize PWA features
    const initializePWA = async () => {
      await requestLocationPermission();
      await registerServiceWorker();
      handleIOSInstallation();
    };

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Display mode change listener
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      setIsInstalled(e.matches);
    };
    mediaQuery.addListener(handleDisplayModeChange);

    // Initialize
    initializePWA();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mediaQuery.removeListener(handleDisplayModeChange);
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) {
      console.log('[PWA] No install prompt available');
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user's choice
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('[PWA] User choice:', outcome);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        setShowInstallPrompt(false);
      }
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Check if we should show install prompt
  const shouldShowPrompt = showInstallPrompt && 
    !isInstalled && 
    !sessionStorage.getItem('pwa-install-dismissed');

  const canInstall = (isInstallable && deferredPrompt !== null) || 
    (platform === 'ios' && !isInstalled);

  return {
    isInstallable: canInstall,
    isInstalled,
    isStandalone,
    platform,
    canInstall,
    installApp,
    dismissInstallPrompt,
    showInstallPrompt: shouldShowPrompt,
  };
};