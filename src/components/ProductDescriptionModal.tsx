
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProductDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    description: string;
    image_url?: string;
  };
  images: string[];
}

const ProductDescriptionModal: React.FC<ProductDescriptionModalProps> = ({
  isOpen,
  onClose,
  product,
  images
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{product.name} - Full Description</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            {images.length > 0 ? (
              images.map((image, index) => (
                <div key={index} className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden">
                  <img 
                    src={image} 
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))
            ) : (
              <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <span className="text-6xl">📦</span>
              </div>
            )}
          </div>

          {/* Product Description */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product Description</h3>
            <ScrollArea className="h-[400px] pr-4">
              <div 
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDescriptionModal;
