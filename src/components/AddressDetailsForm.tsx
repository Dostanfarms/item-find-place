import React, { useState } from 'react';
import { ArrowLeft, Mic, Home, Briefcase, Users, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserAuth } from '@/contexts/UserAuthContext';

interface AddressDetailsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressSaved: (address: any) => void;
  selectedLocation: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
}

const AddressDetailsForm = ({ 
  open, 
  onOpenChange, 
  onAddressSaved,
  selectedLocation 
}: AddressDetailsFormProps) => {
  const { user } = useUserAuth();
  const [houseNumber, setHouseNumber] = useState('');
  const [apartmentArea, setApartmentArea] = useState('');
  const [directions, setDirections] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('Home');
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const labelOptions = [
    { value: 'Home', icon: Home, label: 'Home' },
    { value: 'Work', icon: Briefcase, label: 'Work' },
    { value: 'Friends and Family', icon: Users, label: 'Friends and Family' },
    { value: 'Other', icon: MapPin, label: 'Other' },
  ];

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording functionality can be implemented later
    toast({
      title: "Voice Recording",
      description: "Voice recording feature will be available soon.",
    });
  };

  const handleSaveAddress = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to save addresses.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedLocation) {
      toast({
        title: "Location Required",
        description: "Please select a location first.",
        variant: "destructive",
      });
      return;
    }

    if (!houseNumber.trim()) {
      toast({
        title: "House Number Required",
        description: "Please enter house/flat/block number.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const fullAddress = `${houseNumber}${apartmentArea ? ', ' + apartmentArea : ''}, ${selectedLocation.address}`;

      const { data, error } = await supabase
        .from('user_addresses')
        .insert([{
          user_id: user.id,
          label: selectedLabel,
          house_number: houseNumber,
          apartment_area: apartmentArea || null,
          directions: directions || null,
          full_address: fullAddress,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        }])
        .select()
        .single();

      if (error) throw error;

      const savedAddress = {
        id: data.id,
        label: data.label,
        address: data.full_address,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      onAddressSaved(savedAddress);
      onOpenChange(false);
      
      // Reset form
      setHouseNumber('');
      setApartmentArea('');
      setDirections('');
      setSelectedLabel('Home');

      toast({
        title: "Address Saved",
        description: "Your address has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[90vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="p-0 h-auto"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">
                {selectedLocation?.address?.split(',')[0] || 'Address Details'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {selectedLocation?.address}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Location Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-800">
              A detailed address will help our Delivery Partner reach your doorstep easily
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* House Number */}
            <div className="space-y-2">
              <Label htmlFor="house" className="text-sm font-medium text-muted-foreground uppercase">
                HOUSE / FLAT / BLOCK NO.
              </Label>
              <Input
                id="house"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="Enter house/flat/block number"
                className="h-12"
              />
            </div>

            {/* Apartment/Area */}
            <div className="space-y-2">
              <Label htmlFor="apartment" className="text-sm font-medium text-muted-foreground uppercase">
                APARTMENT / ROAD / AREA <span className="text-muted-foreground">(RECOMMENDED)</span>
              </Label>
              <Input
                id="apartment"
                value={apartmentArea}
                onChange={(e) => setApartmentArea(e.target.value)}
                placeholder="Enter apartment/road/area details"
                className="h-12"
              />
            </div>

            {/* Directions */}
            <div className="space-y-2">
              <Label htmlFor="directions" className="text-sm font-medium text-muted-foreground uppercase">
                DIRECTIONS TO REACH <span className="text-muted-foreground">(OPTIONAL)</span>
              </Label>
              
              {/* Voice Recording Button */}
              <div className="relative">
                <Button
                  variant="outline"
                  className={`w-full h-12 justify-start text-muted-foreground ${
                    isRecording ? 'border-red-500 bg-red-50' : ''
                  }`}
                  onClick={handleVoiceRecording}
                >
                  <Mic className={`h-4 w-4 mr-2 ${isRecording ? 'text-red-500' : ''}`} />
                  {isRecording ? 'Recording...' : 'Tap to record voice directions'}
                </Button>
              </div>

              {/* Text Area */}
              <Textarea
                id="directions"
                value={directions}
                onChange={(e) => setDirections(e.target.value)}
                placeholder="e.g. Ring the bell on the red gate"
                className="h-24 resize-none"
                maxLength={200}
              />
              <div className="text-right text-xs text-muted-foreground">
                {directions.length}/200
              </div>
            </div>

            {/* Save As */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground uppercase">
                SAVE AS
              </Label>
              
              <div className="grid grid-cols-2 gap-3">
                {labelOptions.map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={selectedLabel === value ? "default" : "outline"}
                    className={`h-12 flex items-center gap-2 ${
                      selectedLabel === value 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground'
                    }`}
                    onClick={() => setSelectedLabel(value)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="p-4 border-t">
          <Button
            onClick={handleSaveAddress}
            disabled={isSaving || !houseNumber.trim()}
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium uppercase tracking-wide"
          >
            {isSaving ? 'Saving...' : `ENTER HOUSE / FLAT / BLOCK NO.`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressDetailsForm;