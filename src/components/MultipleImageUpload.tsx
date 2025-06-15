
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MultipleImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  value = [],
  onChange,
  disabled = false,
  maxImages = 4
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Too many files",
        description: `You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please select only image files",
            variant: "destructive"
          });
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select images smaller than 5MB",
            variant: "destructive"
          });
          continue;
        }

        // Convert to base64 for demo purposes
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        newImages.push(base64);
      }

      onChange([...value, ...newImages]);
      
      if (newImages.length > 0) {
        toast({
          title: "Images uploaded",
          description: `${newImages.length} image(s) uploaded successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const canUploadMore = value.length < maxImages;

  return (
    <div className="space-y-4">
      <Label>Product Images (Optional)</Label>
      
      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {value.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {canUploadMore && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-gray-100 rounded-full">
                <Image className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled || uploading}
                    className="pointer-events-none"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload Images'}
                  </Button>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={disabled || uploading}
                />
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p>JPG, PNG, WebP up to 5MB</p>
                <p>Max {maxImages} images ({value.length}/{maxImages} uploaded)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!canUploadMore && (
        <div className="text-center text-sm text-gray-500 p-4 border rounded-lg bg-gray-50">
          Maximum {maxImages} images uploaded. Remove an image to upload more.
        </div>
      )}
    </div>
  );
};

export default MultipleImageUpload;
