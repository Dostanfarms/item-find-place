import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Transaction, DailyEarning, MonthlyEarning } from '@/utils/types';
import { format } from 'date-fns';
import { FarmerProduct } from '@/hooks/useFarmerProducts';
import { Badge } from '@/components/ui/badge';

interface TransactionHistoryProps {
  transactions: Transaction[];
  dailyEarnings: (DailyEarning & { settledAmount?: number; unsettledAmount?: number })[];
  monthlyEarnings: (MonthlyEarning & { settledAmount?: number; unsettledAmount?: number })[];
  products?: FarmerProduct[];
}

interface MonthlyProductSummary {
  name: string;
  category: string;
  unit: string;
  payment_status: string;
  quantity: number;
  totalAmount: number;
  count: number;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions, 
  dailyEarnings, 
  monthlyEarnings,
  products = []
}) => {
  const [tab, setTab] = useState('daily');

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };
  
  // Format month for display
  const formatMonth = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    return `${new Date(0, parseInt(month) - 1).toLocaleString('default', { month: 'long' })} ${year}`;
  };

  // Group products by date for daily view
  const getDailyProductDetails = () => {
    const dailyGroups = new Map();
    
    products.forEach(product => {
      const productDate = format(new Date(product.created_at), 'yyyy-MM-dd');
      if (!dailyGroups.has(productDate)) {
        dailyGroups.set(productDate, []);
      }
      dailyGroups.get(productDate).push(product);
    });
    
    return Array.from(dailyGroups.entries())
      .map(([date, products]) => ({ date, products }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Group and merge products by month for monthly view
  const getMonthlyProductSummary = () => {
    const monthlyGroups = new Map<string, Map<string, MonthlyProductSummary>>();
    
    products.forEach(product => {
      const monthKey = format(new Date(product.created_at), 'yyyy-MM');
      if (!monthlyGroups.has(monthKey)) {
        monthlyGroups.set(monthKey, new Map());
      }
      
      const monthData = monthlyGroups.get(monthKey)!;
      const productKey = `${product.name}_${product.payment_status}`;
      
      if (!monthData.has(productKey)) {
        monthData.set(productKey, {
          name: product.name,
          category: product.category,
          unit: product.unit,
          payment_status: product.payment_status,
          quantity: 0,
          totalAmount: 0,
          count: 0
        });
      }
      
      const existing = monthData.get(productKey)!;
      existing.quantity += product.quantity;
      existing.totalAmount += (product.quantity * product.price_per_unit);
      existing.count += 1;
    });
    
    return Array.from(monthlyGroups.entries())
      .map(([month, productMap]) => ({
        month,
        products: Array.from(productMap.values())
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  };

  const dailyProductDetails = getDailyProductDetails();
  const monthlyProductSummary = getMonthlyProductSummary();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Earnings History</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full" onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="pt-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Daily Product Details</h4>
              <div className="border rounded-md max-h-96 overflow-y-auto">
                {dailyProductDetails.length > 0 ? (
                  dailyProductDetails.map((dayData, index) => (
                    <div key={index} className="border-b last:border-b-0">
                      <div className="bg-muted p-3 font-medium">
                        {formatDate(dayData.date)}
                      </div>
                      <div className="p-2">
                        {dayData.products.map((product: FarmerProduct, productIndex) => (
                          <div key={productIndex} className="flex justify-between items-center py-2 border-b last:border-b-0">
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.quantity} {product.unit} × ₹{product.price_per_unit}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                ₹{(product.quantity * product.price_per_unit).toFixed(2)}
                              </div>
                              <Badge 
                                variant={product.payment_status === 'settled' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {product.payment_status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">No daily product data available</div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="monthly" className="pt-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Monthly Product Summary</h4>
              <div className="border rounded-md max-h-96 overflow-y-auto">
                {monthlyProductSummary.length > 0 ? (
                  monthlyProductSummary.map((monthData, index) => (
                    <div key={index} className="border-b last:border-b-0">
                      <div className="bg-muted p-3 font-medium">
                        {formatMonth(monthData.month)}
                      </div>
                      <div className="p-2">
                        {monthData.products.map((product: MonthlyProductSummary, productIndex) => (
                          <div key={productIndex} className="flex justify-between items-center py-2 border-b last:border-b-0">
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Total: {product.quantity} {product.unit} | Transactions: {product.count}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                ₹{product.totalAmount.toFixed(2)}
                              </div>
                              <Badge 
                                variant={product.payment_status === 'settled' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {product.payment_status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">No monthly product data available</div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
