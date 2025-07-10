import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, MapPin, Edit, AlertTriangle, Navigation } from 'lucide-react';
import { StudentResidence } from './StudentResidence';

interface ResidenceDashboardCardProps {
  residence: StudentResidence | null;
  onEditClick: () => void;
}

export const ResidenceDashboardCard = ({ residence, onEditClick }: ResidenceDashboardCardProps) => {
  const formatCompactAddress = (res: StudentResidence) => {
    const parts = [
      res.streetAddress,
      res.unitRoomNumber ? `#${res.unitRoomNumber}` : '',
      res.city,
      res.stateProvince
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const openInMaps = () => {
    if (!residence) return;
    
    const address = [
      residence.streetAddress,
      residence.unitRoomNumber || '',
      residence.city,
      residence.stateProvince,
      residence.postalCode,
      residence.country
    ].filter(Boolean).join(', ');
    
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://maps.google.com/maps?q=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  if (!residence) {
    return (
      <Card className="shadow-card border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-base">Residence Not Set</CardTitle>
                <CardDescription>Add your residence for emergency response</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              Required
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-orange-600 mb-3">
            Emergency responders need your residence information for faster assistance.
          </p>
          <Button
            onClick={onEditClick}
            variant="outline"
            size="sm"
            className="w-full gap-2 border-orange-200 hover:bg-orange-50"
          >
            <Home className="h-4 w-4" />
            Add Residence Information
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card bg-gradient-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{residence.residenceName}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Student Residence
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditClick}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {formatCompactAddress(residence)}
            </p>
            <p className="text-xs text-muted-foreground">
              {residence.postalCode}, {residence.country}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={openInMaps}
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
            >
              <Navigation className="h-4 w-4" />
              View on Map
            </Button>
            <Badge variant="default" className="gap-1 px-3">
              <Home className="h-3 w-3" />
              Verified
            </Badge>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Updated: {residence.updatedAt.toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};