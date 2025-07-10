import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, MessageSquare, Trash2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  methods: ('sms' | 'email' | 'whatsapp')[];
}

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
  onContactsChange: (contacts: EmergencyContact[]) => void;
}

export const EmergencyContacts = ({ contacts, onContactsChange }: EmergencyContactsProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    whatsapp: '',
    methods: [] as ('sms' | 'email' | 'whatsapp')[]
  });
  const { toast } = useToast();

  const addContact = () => {
    if (!newContact.name || !newContact.relationship || newContact.methods.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in name, relationship, and select at least one contact method.",
        variant: "destructive",
      });
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name,
      relationship: newContact.relationship,
      phone: newContact.phone || undefined,
      email: newContact.email || undefined,
      whatsapp: newContact.whatsapp || undefined,
      methods: newContact.methods,
    };

    onContactsChange([...contacts, contact]);
    setNewContact({
      name: '',
      relationship: '',
      phone: '',
      email: '',
      whatsapp: '',
      methods: []
    });
    setIsAdding(false);
    
    console.log('Contact added successfully:', contact);
    
    toast({
      title: "Contact Added",
      description: `${contact.name} has been added to your emergency contacts.`,
    });
  };

  const removeContact = (id: string) => {
    onContactsChange(contacts.filter(c => c.id !== id));
    toast({
      title: "Contact Removed",
      description: "Emergency contact has been removed.",
    });
  };

  const toggleMethod = (method: 'sms' | 'email' | 'whatsapp') => {
    const methods = newContact.methods.includes(method)
      ? newContact.methods.filter(m => m !== method)
      : [...newContact.methods, method];
    setNewContact({ ...newContact, methods });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Emergency Contacts</h3>
          <p className="text-sm text-muted-foreground">
            Add trusted contacts who will be notified during emergencies
          </p>
        </div>
        <Button
          variant="hero"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Contact List */}
      <div className="space-y-3">
        {contacts.map((contact) => (
          <Card key={contact.id} className="shadow-soft">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{contact.name}</CardTitle>
                  <CardDescription>{contact.relationship}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContact(contact.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {contact.methods.map((method) => (
                  <Badge key={method} variant="secondary" className="gap-1">
                    {method === 'sms' && <Phone className="h-3 w-3" />}
                    {method === 'email' && <Mail className="h-3 w-3" />}
                    {method === 'whatsapp' && <MessageSquare className="h-3 w-3" />}
                    {method.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Contact Form */}
      {isAdding && (
        <Card className="shadow-soft border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Add Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Contact name"
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  placeholder="e.g., Parent, Friend, RA"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Contact Methods</Label>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant={newContact.methods.includes('sms') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleMethod('sms')}
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    SMS
                  </Button>
                  {newContact.methods.includes('sms') && (
                    <Input
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder="Phone number"
                      className="flex-1"
                    />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant={newContact.methods.includes('email') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleMethod('email')}
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  {newContact.methods.includes('email') && (
                    <Input
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      placeholder="Email address"
                      type="email"
                      className="flex-1"
                    />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant={newContact.methods.includes('whatsapp') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleMethod('whatsapp')}
                    className="gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp
                  </Button>
                  {newContact.methods.includes('whatsapp') && (
                    <Input
                      value={newContact.whatsapp}
                      onChange={(e) => setNewContact({ ...newContact, whatsapp: e.target.value })}
                      placeholder="WhatsApp number"
                      className="flex-1"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={addContact} className="flex-1">
                Add Contact
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAdding(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {contacts.length === 0 && !isAdding && (
        <Card className="shadow-soft border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">No Emergency Contacts</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add trusted contacts who will receive emergency alerts
            </p>
            <Button
              variant="hero"
              onClick={() => setIsAdding(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Contact
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};