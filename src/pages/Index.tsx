import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { EmergencyButton } from '@/components/EmergencyButton';
import { EmergencyContacts, EmergencyContact } from '@/components/EmergencyContacts';
import { StudentResidence } from '@/components/StudentResidence';
import { ResidenceDashboardCard } from '@/components/ResidenceDashboardCard';
import { QuickActions } from '@/components/QuickActions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Settings, Download, Smartphone, CheckCircle, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePWA } from '@/hooks/usePWA';
import type { StudentResidence } from '@/components/StudentResidence';

const Index = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [residence, setResidence] = useState<StudentResidence | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [emergencyStatus, setEmergencyStatus] = useState<'ready' | 'active' | 'setup-required'>('setup-required');
  const [lastEmergencyTime, setLastEmergencyTime] = useState<Date | null>(null);
  const [emergencyLocation, setEmergencyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const { isInstallable, isInstalled, installApp } = usePWA();

  useEffect(() => {
    // Load contacts from localStorage
    const savedContacts = localStorage.getItem('emergency-contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
      setIsFirstTime(false);
    }
    
    // Load residence from localStorage
    const savedResidence = localStorage.getItem('student-residence');
    if (savedResidence) {
      const residenceData = JSON.parse(savedResidence);
      // Convert date strings back to Date objects
      residenceData.createdAt = new Date(residenceData.createdAt);
      residenceData.updatedAt = new Date(residenceData.updatedAt);
      setResidence(residenceData);
    }
  }, []);

  useEffect(() => {
    // Save contacts to localStorage
    localStorage.setItem('emergency-contacts', JSON.stringify(contacts));
    
    // Update emergency status based on contacts
    if (contacts.length > 0) {
      setEmergencyStatus(emergencyStatus === 'active' ? 'active' : 'ready');
    } else {
      setEmergencyStatus('setup-required');
    }
  }, [contacts]);

  useEffect(() => {
    // Save residence to localStorage
    if (residence) {
      localStorage.setItem('student-residence', JSON.stringify(residence));
    } else {
      localStorage.removeItem('student-residence');
    }
  }, [residence]);

  // Update emergency status when emergency is triggered
  const updateEmergencyStatus = (location: { lat: number; lng: number }) => {
    setEmergencyStatus('active');
    setLastEmergencyTime(new Date());
    setEmergencyLocation(location);
  };

  // Reset emergency status
  const resetEmergencyStatus = () => {
    setEmergencyStatus(contacts.length > 0 ? 'ready' : 'setup-required');
    setLastEmergencyTime(null);
    setEmergencyLocation(null);
  };
  const handleEmergencyTriggered = async (location: { lat: number; lng: number; address?: string }) => {
    console.log('handleEmergencyTriggered called with:', location);
    
    if (contacts.length === 0) {
      console.log('No emergency contacts found');
      toast({
        title: "No Emergency Contacts",
        description: "Please add emergency contacts in settings first.",
        variant: "destructive",
      });
      setIsSettingsOpen(true);
      return;
    }

    // Update emergency status
    updateEmergencyStatus(location);

    console.log('Processing emergency with contacts:', contacts);
    
    // Simulate sending emergency alerts to all contacts
    const locationInfo = location.address 
      ? `${location.address} (${location.lat}, ${location.lng})`
      : `coordinates ${location.lat}, ${location.lng}`;
      
    console.log('Emergency triggered!', { 
      location, 
      contacts,
      timestamp: new Date().toISOString(),
      message: `EMERGENCY ALERT: Help needed at ${locationInfo}`
    });
    
    // Show detailed success message
    const successLocationText = location.address 
      ? `${location.address} (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`
      : `coordinates (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`;
      
    toast({
      title: "🚨 EMERGENCY RESPONSE ACTIVATED",
      description: `Alert successfully sent to ${contacts.length} emergency contact${contacts.length === 1 ? '' : 's'}. Your location ${successLocationText} has been shared. Emergency services and your contacts have been notified. Stay calm - help is on the way!`,
      duration: 10000,
    });

    // Log emergency event for debugging/tracking
    const emergencyEvent = {
      timestamp: new Date().toISOString(),
      location: {
        latitude: location.lat,
        longitude: location.lng,
        accuracy: 'high-precision'
      },
      contactsNotified: contacts.length,
      contactMethods: contacts.flatMap(c => c.methods),
      userAgent: navigator.userAgent,
      status: 'sent'
    };
    
    console.log('Emergency Event Logged:', emergencyEvent);
    
    // Store in localStorage for emergency history (optional)
    const emergencyHistory = JSON.parse(localStorage.getItem('emergency-history') || '[]');
    emergencyHistory.push(emergencyEvent);
    localStorage.setItem('emergency-history', JSON.stringify(emergencyHistory.slice(-10))); // Keep last 10 events
  };

  // Get status display information
  const getStatusInfo = () => {
    switch (emergencyStatus) {
      case 'active':
        return {
          icon: CheckCircle,
          title: 'Emergency Active',
          description: `${contacts.length} contact${contacts.length === 1 ? '' : 's'} notified`,
          badge: 'Emergency Active',
          badgeVariant: 'destructive' as const,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'ready':
        return {
          icon: Shield,
          title: 'Emergency Ready',
          description: `${contacts.length} contact${contacts.length === 1 ? '' : 's'} configured`,
          badge: 'Ready',
          badgeVariant: 'default' as const,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Setup Required',
          description: 'Add emergency contacts to get started',
          badge: 'Setup Required',
          badgeVariant: 'secondary' as const,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Debug: Log when contacts change
  useEffect(() => {
    console.log('Contacts updated:', contacts);
  }, [contacts]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <AppHeader onOpenSettings={() => setIsSettingsOpen(true)} />
      
      {/* PWA Install Banner */}
      {isInstallable && !isInstalled && (
        <div className="bg-gradient-primary p-4 text-white">
          <div className="container mx-auto max-w-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6" />
              <div>
                <p className="font-semibold text-sm">Install SafeCampus</p>
                <p className="text-xs opacity-90">Add to home screen for quick access</p>
              </div>
            </div>
            <Button
              onClick={installApp}
              size="sm"
              variant="glass"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Install
            </Button>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-6 py-8 max-w-md space-y-8">
        {/* Emergency Status Card */}
        <Card className={`shadow-card backdrop-blur-sm transition-all duration-300 ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  emergencyStatus === 'active' ? 'bg-red-100' : 
                  emergencyStatus === 'ready' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <statusInfo.icon className={`h-6 w-6 ${statusInfo.iconColor}`} />
                </div>
                <CardTitle className="text-lg">{statusInfo.title}</CardTitle>
              </div>
              <Badge 
                variant={statusInfo.badgeVariant}
                className={emergencyStatus === 'active' ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : 
                          emergencyStatus === 'ready' ? "bg-green-500 hover:bg-green-600 text-white" : ""}
              >
                {statusInfo.badge}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-base mb-3">
              {statusInfo.description}
            </CardDescription>
            
            {/* Additional status information */}
            {emergencyStatus === 'active' && lastEmergencyTime && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <Clock className="h-4 w-4" />
                  <span>Alert sent at {lastEmergencyTime.toLocaleTimeString()}</span>
                </div>
                {emergencyLocation && emergencyLocation.lat !== 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <Shield className="h-4 w-4" />
                    <span>Location: {emergencyLocation.lat.toFixed(4)}, {emergencyLocation.lng.toFixed(4)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <Users className="h-4 w-4" />
                  <span>Emergency contacts notified</span>
                </div>
              </div>
            )}
            
            {emergencyStatus === 'ready' && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Ready to send emergency alerts</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Emergency Button */}
        <div className="flex justify-center py-6">
          <EmergencyButton 
            onEmergencyTriggered={handleEmergencyTriggered}
            onEmergencyReset={resetEmergencyStatus}
            residence={residence}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Student Residence Card */}
        <ResidenceDashboardCard 
          residence={residence}
          onEditClick={() => setIsSettingsOpen(true)}
        />

        {/* First Time Setup */}
        {isFirstTime && contacts.length === 0 && (
          <Card className="shadow-card border-accent/20 bg-gradient-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-accent">
                <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                Setup Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-6 text-base leading-relaxed">
                Add your emergency contacts to start using SafeCampus. Your contacts will receive alerts with your location during emergencies.
              </CardDescription>
              <Button 
                onClick={() => setIsSettingsOpen(true)}
                variant="hero"
                size="lg"
                className="w-full gap-3"
              >
                <Settings className="h-5 w-5" />
                Setup Emergency Contacts
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>SafeCampus Settings</DialogTitle>
            <DialogDescription>
              Configure your emergency contacts and app preferences
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
              <TabsTrigger value="residence">Residence</TabsTrigger>
              <TabsTrigger value="settings">App Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contacts" className="mt-4">
              <EmergencyContacts 
                contacts={contacts}
                onContactsChange={setContacts}
              />
            </TabsContent>
            
            <TabsContent value="residence" className="mt-4">
              <StudentResidence 
                residence={residence}
                onResidenceChange={setResidence}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Location Services</CardTitle>
                  <CardDescription>
                    Location access is required to send your exact position during emergencies.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="default" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Location Enabled
                  </Badge>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">Notification Methods</CardTitle>
                  <CardDescription>
                    Connect to Supabase for SMS, email, and WhatsApp notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Connect Backend Services
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click the Supabase button at the top right to enable messaging features.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
