
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, IndianRupee, User, Phone, Mail, MapPin, Building2, CreditCard } from 'lucide-react';
import { useFarmers } from '@/hooks/useFarmers';
import { useFarmerProducts } from '@/hooks/useFarmerProducts';
import { format } from 'date-fns';
import FarmerPaymentDetailsModal from '@/components/FarmerPaymentDetailsModal';
import FarmerProductForm from '@/components/farmer/FarmerProductForm';
import FixedHeader from '@/components/layout/FixedHeader';
import ProfileChangeDialog from '@/components/profile/ProfileChangeDialog';

const FarmerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { farmers, loading: farmersLoading } = useFarmers();
  const { farmerProducts, loading: productsLoading } = useFarmerProducts();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileMode, setProfileMode] = useState<'photo' | 'password'>('photo');

  const farmer = farmers.find(f => f.id === id);
  const products = farmerProducts.filter(p => p.farmer_id === id);

  const handleChangePhoto = () => {
    setProfileMode('photo');
    setShowProfileDialog(true);
  };

  const handleChangePassword = () => {
    setProfileMode('password');
    setShowProfileDialog(true);
  };

  const handleViewReceipt = (receiptUrl: string) => {
    window.open(receiptUrl, '_blank');
  };

  const handleSettle = (farmerSummary: any) => {
    // Handle settlement logic here
    console.log('Settlement data:', farmerSummary);
    setShowPaymentModal(false);
  };

  if (farmersLoading || productsLoading) {
    return (
      <div className="pt-16">
        <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading farmer details...</div>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="pt-16">
        <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Farmer not found</h2>
            <p className="text-gray-600 mt-2">The farmer you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/farmers')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Farmers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = products.reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const settledAmount = products.filter(p => p.payment_status === 'settled').reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);
  const unsettledAmount = products.filter(p => p.payment_status === 'unsettled').reduce((sum, product) => sum + (product.quantity * product.price_per_unit), 0);

  return (
    <div className="pt-16">
      <FixedHeader onChangePhoto={handleChangePhoto} onChangePassword={handleChangePassword} />
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/farmers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{farmer.name}</h1>
              <p className="text-muted-foreground">Farmer Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowProductForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Products
            </Button>
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <IndianRupee className="h-4 w-4 mr-2" />
              Settle Payment
            </Button>
          </div>
        </div>

        {/* Farmer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{farmer.phone}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{farmer.email}</span>
                  </div>
                </div>
              </div>
              
              {farmer.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{farmer.address}</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {farmer.village && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Village</label>
                    <p>{farmer.village}</p>
                  </div>
                )}
                {farmer.district && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">District</label>
                    <p>{farmer.district}</p>
                  </div>
                )}
                {farmer.state && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">State</label>
                    <p>{farmer.state}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bank Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {farmer.bank_name ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{farmer.bank_name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                    <p className="font-mono">{farmer.account_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IFSC Code</label>
                    <p className="font-mono">{farmer.ifsc_code}</p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No bank information provided</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Settled Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{settledAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unsettled Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{unsettledAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{format(new Date(product.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">{product.quantity} {product.unit}</TableCell>
                      <TableCell className="text-right">₹{product.price_per_unit.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{(product.quantity * product.price_per_unit).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={product.payment_status === 'settled' ? 'default' : 'destructive'}
                          className={product.payment_status === 'settled' ? 'bg-green-600' : ''}
                        >
                          {product.payment_status === 'settled' ? 'SETTLED' : 'UNSETTLED'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {products.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No products found for this farmer.
              </div>
            )}
          </CardContent>
        </Card>

        <FarmerPaymentDetailsModal
          farmer={farmer}
          products={products}
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSettle={handleSettle}
          onViewReceipt={handleViewReceipt}
        />

        <FarmerProductForm
          open={showProductForm}
          onClose={() => setShowProductForm(false)}
          farmerId={farmer.id}
        />

        <ProfileChangeDialog
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          mode={profileMode}
        />
      </div>
    </div>
  );
};

export default FarmerDetails;
