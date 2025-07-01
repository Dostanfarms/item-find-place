
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useProductSizes } from '@/hooks/useProductSizes';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductSizeDisplay from '@/components/ProductSizeDisplay';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { products } = useProducts();
  const { fetchProductSizes } = useProductSizes();
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [productSizes, setProductSizes] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === id);

  useEffect(() => {
    if (product && product.category === 'Fashion') {
      fetchProductSizes(product.id).then(sizes => {
        setProductSizes(sizes);
      });
    }
  }, [product, fetchProductSizes]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/customer/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const isFashionProduct = product.category === 'Fashion';
  const availableQuantity = isFashionProduct 
    ? (selectedSize ? productSizes.find(s => s.size === selectedSize)?.quantity || 0 : 0)
    : product.quantity;

  const isOutOfStock = availableQuantity === 0;

  const handleAddToCart = () => {
    if (isFashionProduct && !selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size before adding to cart",
        variant: "destructive"
      });
      return;
    }

    if (isOutOfStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive"
      });
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      pricePerUnit: product.price_per_unit,
      quantity,
      unit: product.unit,
      category: product.category,
      size: isFashionProduct ? selectedSize : undefined,
      farmerId: null
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/customer/products')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className="h-24 w-24 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{product.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{product.category}</Badge>
                      <Badge variant={product.is_active !== false ? "default" : "secondary"}>
                        {product.is_active !== false ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      ₹{product.price_per_unit}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per {product.unit}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{product.description}</p>
                  </div>
                )}

                {/* Size Selection for Fashion Products */}
                {isFashionProduct && (
                  <div>
                    <ProductSizeDisplay
                      sizes={productSizes}
                      selectedSize={selectedSize}
                      onSizeSelect={setSelectedSize}
                    />
                  </div>
                )}

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Stock:</span>
                  {isOutOfStock ? (
                    <Badge variant="destructive">Out of Stock</Badge>
                  ) : (
                    <Badge variant="default">
                      {availableQuantity} {product.unit} available
                    </Badge>
                  )}
                </div>

                {/* Quantity Selector */}
                {!isOutOfStock && (
                  <div className="flex items-center gap-4">
                    <label className="font-medium">Quantity:</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
                        disabled={quantity >= availableQuantity}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || (isFashionProduct && !selectedSize)}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
