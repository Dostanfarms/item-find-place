
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, User, LogOut, Truck, BarChart3, Plus, Ticket } from 'lucide-react';
import { useFarmerProducts } from '@/hooks/useFarmerProducts';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<any>(null);
  const { products, loading: productsLoading, fetchFarmerProducts } = useFarmerProducts();

  useEffect(() => {
    const currentFarmer = localStorage.getItem('currentFarmer');
    if (!currentFarmer) {
      navigate('/farmer-login');
      return;
    }
    
    try {
      const farmerData = JSON.parse(currentFarmer);
      if (!farmerData || !farmerData.id) {
        navigate('/farmer-login');
        return;
      }
      
      setFarmer(farmerData);
      
      // Fetch farmer products
      fetchFarmerProducts(farmerData.id);
    } catch (error) {
      console.error('Error parsing farmer data:', error);
      navigate('/farmer-login');
    }
  }, [navigate, fetchFarmerProducts]);

  const handleLogout = () => {
    localStorage.removeItem('currentFarmer');
    navigate('/farmer-login');
  };

  const handleAddProduct = () => {
    // Navigate to farmer details page where they can add products
    if (farmer?.id) {
      navigate(`/farmer/${farmer.id}`);
    }
  };

  const handleViewTickets = () => {
    navigate('/farmer-tickets');
  };

  if (!farmer) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-agri-primary" />
            <span className="text-lg font-bold">DostanFarms</span>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Welcome Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Welcome, {farmer.name}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{farmer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{farmer.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="font-medium">{products?.length || 0} items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Products Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Products ({products?.length || 0})
              </span>
              <Button 
                size="sm"
                onClick={handleAddProduct}
                className="bg-agri-primary hover:bg-agri-secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products added yet</p>
                <p className="text-sm">Add your first product to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm"><span className="font-medium">Quantity:</span> {product.quantity} {product.unit}</p>
                        <p className="text-sm"><span className="font-medium">Price:</span> ₹{product.price_per_unit}/{product.unit}</p>
                        <p className="text-sm"><span className="font-medium">Total:</span> ₹{(product.quantity * product.price_per_unit).toFixed(2)}</p>
                      </div>
                      {product.barcode && (
                        <p className="text-xs text-muted-foreground mt-2">Barcode: {product.barcode}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleAddProduct}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Manage Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Add and manage your products</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleViewTickets}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Support Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View and create support tickets</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sales Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View your sales analytics</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
