import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { EmergencyButton } from '@/components/EmergencyButton';
import { EmergencyContacts, EmergencyContact } from '@/components/EmergencyContacts';
import { QuickActions } from '@/components/QuickActions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load contacts from localStorage
    const savedContacts = localStorage.getItem('emergency-contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
      setIsFirstTime(false);
    }
  }, []);

  useEffect(() => {
    // Save contacts to localStorage
    localStorage.setItem('emergency-contacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleEmergencyTriggered = async (location: { lat: number; lng: number }) => {
    if (contacts.length === 0) {
      toast({
        title: "No Emergency Contacts",
        description: "Please add emergency contacts in settings first.",
        variant: "destructive",
      });
      setIsSettingsOpen(true);
      return;
    }

    // In a real app, this would integrate with Supabase to send actual notifications
    console.log('Emergency triggered!', { location, contacts });
    
    toast({
      title: "Emergency Alert Sent!",
      description: `Alert sent to ${contacts.length} contacts with your location: ${location.lat}, ${location.lng}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <AppHeader onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="container mx-auto px-4 py-8 max-w-md">
        {/* Emergency Status */}
        <Card className="mb-6 shadow-soft border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Emergency Status</CardTitle>
              </div>
              <Badge variant={contacts.length > 0 ? "default" : "secondary"}>
                {contacts.length > 0 ? "Ready" : "Setup Required"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription>
              {contacts.length > 0 
                ? `${contacts.length} emergency contacts configured`
                : "Add emergency contacts to get started"
              }
            </CardDescription>
          </CardContent>
        </Card>

        {/* Main Emergency Button */}
        <div className="flex justify-center mb-8">
          <EmergencyButton onEmergencyTriggered={handleEmergencyTriggered} />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* First Time Setup */}
        {isFirstTime && contacts.length === 0 && (
          <Card className="mt-6 shadow-soft border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <AlertTriangle className="h-5 w-5" />
                Setup Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                Add your emergency contacts to start using SafeCampus. Your contacts will receive alerts with your location during emergencies.
              </CardDescription>
              <Button 
                onClick={() => setIsSettingsOpen(true)}
                variant="hero"
                className="w-full gap-2"
              >
                <Settings className="h-4 w-4" />
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
              <TabsTrigger value="settings">App Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contacts" className="mt-4">
              <EmergencyContacts 
                contacts={contacts}
                onContactsChange={setContacts}
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
