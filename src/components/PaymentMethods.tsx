
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';

interface PaymentMethodsProps {
  total: number;
  onPaymentMethodSelect: (method: string, appUrl?: string) => void;
  disabled?: boolean;
  onQRPaymentComplete?: () => void;
}

const PaymentMethods = ({ total, onPaymentMethodSelect, disabled = false, onQRPaymentComplete }: PaymentMethodsProps) => {
  const [showQR, setShowQR] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const upiId = "2755c@ybl";
  
  const generateUPIUrl = (app: string) => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: "Dostan Farms",
      am: total.toString(),
      cu: "INR",
      tn: `Payment for Order ${Date.now()}`
    });
    
    const baseUrls: { [key: string]: string } = {
      gpay: "tez://upi/pay",
      phonepe: "phonepe://upi/pay",
      paytm: "paytmmp://upi/pay",
      bhim: "bhim://upi/pay"
    };
    
    return `${baseUrls[app]}?${params.toString()}`;
  };

  const paymentApps = [
    {
      id: 'gpay',
      name: 'Google Pay',
      icon: '🔵',
      color: 'bg-blue-50 border-blue-200',
      url: generateUPIUrl('gpay')
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: '🟣',
      color: 'bg-purple-50 border-purple-200',
      url: generateUPIUrl('phonepe')
    },
    {
      id: 'paytm',
      name: 'PayTM',
      icon: '🔷',
      color: 'bg-blue-50 border-blue-200',
      url: generateUPIUrl('paytm')
    },
    {
      id: 'bhim',
      name: 'BHIM UPI',
      icon: '🟢',
      color: 'bg-green-50 border-green-200',
      url: generateUPIUrl('bhim')
    }
  ];

  const handleUPIAppClick = (app: any) => {
    if (disabled) return;
    
    // Try to open the app
    window.location.href = app.url;
    
    // Fallback: if app doesn't open after 2 seconds, show UPI ID
    setTimeout(() => {
      const fallbackUrl = `upi://pay?pa=${upiId}&pn=Dostan Farms&am=${total}&cu=INR&tn=Payment for Order ${Date.now()}`;
      onPaymentMethodSelect('upi', fallbackUrl);
    }, 2000);
  };

  const handleShowQR = () => {
    setShowQR(true);
    onPaymentMethodSelect('qr');
  };

  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    if (onQRPaymentComplete) {
      onQRPaymentComplete();
    }
  };

  const qrValue = `upi://pay?pa=${upiId}&pn=Dostan Farms&am=${total}&cu=INR&tn=Payment for Order ${Date.now()}`;

  return (
    <div className="space-y-4">
      {/* UPI Payment Options */}
      <div>
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          UPI Payment Options
        </h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {paymentApps.map((app) => (
            <Button
              key={app.id}
              variant="outline"
              className={`h-16 flex flex-col items-center justify-center gap-1 ${app.color} hover:bg-opacity-80 transition-all`}
              onClick={() => handleUPIAppClick(app)}
              disabled={disabled}
            >
              <span className="text-2xl">{app.icon}</span>
              <span className="text-sm font-medium">{app.name}</span>
            </Button>
          ))}
        </div>

        {/* QR Code Option */}
        <Button
          variant="outline"
          className="w-full h-14 flex items-center justify-between bg-green-50 border-green-200 hover:bg-green-100 mb-4"
          onClick={handleShowQR}
          disabled={disabled}
        >
          <div className="flex items-center gap-3">
            <QrCode className="h-6 w-6 text-green-600" />
            <span className="font-medium">Show QR Code</span>
          </div>
          <span className="text-sm text-green-600">Scan & Pay</span>
        </Button>

        {/* QR Code Display */}
        {showQR && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
            <h4 className="font-medium mb-3">Scan QR Code to Pay</h4>
            <div className="bg-white p-4 rounded-lg inline-block border">
              <QRCode
                value={qrValue}
                size={200}
              />
            </div>
            <p className="text-sm text-gray-600 mt-3 mb-4">
              Amount: ₹{total.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              UPI ID: {upiId}
            </p>
            
            {!paymentCompleted ? (
              <Button
                onClick={handlePaymentComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={disabled}
              >
                Payment Completed
              </Button>
            ) : (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-600 font-medium">✓ Payment Completed Successfully!</p>
              </div>
            )}
          </div>
        )}

        {/* Generic UPI Option */}
        <Button
          variant="outline"
          className="w-full h-14 flex items-center justify-between bg-gray-50 border-gray-200 hover:bg-gray-100"
          onClick={() => onPaymentMethodSelect('upi')}
          disabled={disabled}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔗</span>
            <span className="font-medium">Other UPI Apps</span>
          </div>
          <span className="text-sm text-gray-500">UPI ID: {upiId}</span>
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethods;
