import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Home, MapPin, Edit, Save, X, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface StudentResidence {
  id: string;
  residenceName: string;
  streetAddress: string;
  unitRoomNumber?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StudentResidenceProps {
  residence: StudentResidence | null;
  onResidenceChange: (residence: StudentResidence | null) => void;
}

export const StudentResidence = ({ residence, onResidenceChange }: StudentResidenceProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    residenceName: residence?.residenceName || '',
    streetAddress: residence?.streetAddress || '',
    unitRoomNumber: residence?.unitRoomNumber || '',
    city: residence?.city || '',
    stateProvince: residence?.stateProvince || '',
    postalCode: residence?.postalCode || '',
    country: residence?.country || 'United States'
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['residenceName', 'streetAddress', 'city', 'stateProvince', 'postalCode', 'country'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]?.trim());
    
    if (missing.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missing.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const saveResidence = () => {
    if (!validateForm()) return;

    const residenceData: StudentResidence = {
      id: residence?.id || Date.now().toString(),
      ...formData,
      createdAt: residence?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onResidenceChange(residenceData);
    setIsEditing(false);
    
    toast({
      title: "Residence Updated",
      description: "Your residence information has been saved successfully.",
    });
  };

  const cancelEdit = () => {
    if (residence) {
      setFormData({
        residenceName: residence.residenceName,
        streetAddress: residence.streetAddress,
        unitRoomNumber: residence.unitRoomNumber || '',
        city: residence.city,
        stateProvince: residence.stateProvince,
        postalCode: residence.postalCode,
        country: residence.country
      });
    }
    setIsEditing(false);
  };

  const formatAddress = (res: StudentResidence) => {
    const parts = [
      res.streetAddress,
      res.unitRoomNumber ? `Unit ${res.unitRoomNumber}` : '',
      res.city,
      `${res.stateProvince} ${res.postalCode}`,
      res.country !== 'United States' ? res.country : ''
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  if (!residence && !isEditing) {
    return (
      <Card className="shadow-soft border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Home className="h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="font-medium mb-2">No Residence Information</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Add your residence details for emergency response
          </p>
          <Button
            variant="hero"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Add Residence
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Student Residence</h3>
          <p className="text-sm text-muted-foreground">
            Your current residence information for emergency response
          </p>
        </div>
        {residence && !isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <Card className="shadow-soft border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              {residence ? 'Edit Residence' : 'Add Residence'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="residenceName">Residence Name *</Label>
                <Input
                  id="residenceName"
                  value={formData.residenceName}
                  onChange={(e) => handleInputChange('residenceName', e.target.value)}
                  placeholder="e.g., Johnson Hall, Sunset Apartments"
                />
              </div>

              <div>
                <Label htmlFor="streetAddress">Street Address *</Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  placeholder="e.g., 123 University Drive"
                />
              </div>

              <div>
                <Label htmlFor="unitRoomNumber">Unit/Room Number</Label>
                <Input
                  id="unitRoomNumber"
                  value={formData.unitRoomNumber}
                  onChange={(e) => handleInputChange('unitRoomNumber', e.target.value)}
                  placeholder="e.g., Room 204, Apt 3B"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="e.g., Boston"
                  />
                </div>
                <div>
                  <Label htmlFor="stateProvince">State/Province *</Label>
                  <Input
                    id="stateProvince"
                    value={formData.stateProvince}
                    onChange={(e) => handleInputChange('stateProvince', e.target.value)}
                    placeholder="e.g., MA, Ontario"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="e.g., 02115, K1A 0A6"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="e.g., United States, Canada"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={saveResidence} className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                Save Residence
              </Button>
              <Button
                variant="outline"
                onClick={cancelEdit}
                className="flex-1 gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : residence && (
        <Card className="shadow-soft">
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
                    Current Residence
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Building className="h-3 w-3" />
                Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-medium text-foreground">{formatAddress(residence)}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated: {residence.updatedAt.toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};