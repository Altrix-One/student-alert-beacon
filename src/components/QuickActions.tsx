import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, MapPin, Users, BookOpen, Heart } from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      icon: Phone,
      label: 'Campus Security',
      description: 'Call campus security',
      color: 'text-primary',
      onClick: () => window.open('tel:+1234567890')
    },
    {
      icon: Heart,
      label: 'Health Center',
      description: 'University health services',
      color: 'text-emergency',
      onClick: () => window.open('tel:+1234567890')
    },
    {
      icon: MapPin,
      label: 'Safe Locations',
      description: 'Find nearby safe spaces',
      color: 'text-accent',
      onClick: () => alert('Feature coming soon!')
    },
    {
      icon: Users,
      label: 'Peer Support',
      description: 'Connect with counselors',
      color: 'text-primary',
      onClick: () => alert('Feature coming soon!')
    }
  ];

  return (
    <Card className="shadow-soft">
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-sm text-foreground">Quick Actions</h3>
          <p className="text-xs text-muted-foreground">Access important campus resources</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className="h-auto p-3 flex-col gap-2 hover:bg-primary/5"
              onClick={action.onClick}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <div className="text-center">
                <div className="text-xs font-medium">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};