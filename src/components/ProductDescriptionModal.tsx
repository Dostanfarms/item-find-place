
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Package } from 'lucide-react';

interface ProductDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    description?: string;
    category: string;
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Product Image */}
          <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden">
            {images.length > 0 ? (
              <img 
                src={images[0]} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {product.category === 'Vegetables' && '🥬'}
                {product.category === 'Fruits' && '🍎'}
                {product.category === 'Grains' && '🌾'}
                {product.category === 'Dairy' && '🥛'}
                {product.category === 'Fashion' && '👕'}
                {!['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Fashion'].includes(product.category) && 
                  <Package className="h-20 w-20 text-green-600" />
                }
              </div>
            )}
          </div>
          
          {/* Full Description */}
          {product.description && product.description.trim().length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <div 
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDescriptionModal;
