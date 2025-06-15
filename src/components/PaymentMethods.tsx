
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, QrCode, CheckCircle } from 'lucide-react';
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
  const [showUPIConfirmation, setShowUPIConfirmation] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string>('');
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
    
    // Set selected app and show confirmation
    setSelectedApp(app.name);
    setShowUPIConfirmation(true);
    
    // Try to open the app
    window.location.href = app.url;
    
    // Select UPI as payment method
    onPaymentMethodSelect('upi', app.url);
  };

  const handleUPIPaymentComplete = () => {
    setShowUPIConfirmation(false);
    setPaymentCompleted(true);
    if (onQRPaymentComplete) {
      onQRPaymentComplete();
    }
  };

  const handleShowQR = () => {
    setShowQR(true);
    onPaymentMethodSelect('qr');
  };

  const handleQRPaymentComplete = () => {
    setPaymentCompleted(true);
    if (onQRPaymentComplete) {
      onQRPaymentComplete();
    }
  };

  const qrValue = `upi://pay?pa=${upiId}&pn=Dostan Farms&am=${total}&cu=INR&tn=Payment for Order ${Date.now()}`;

  return (
    <div className="space-y-4">
      {/* Payment Success Message */}
      {paymentCompleted && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-600 font-medium text-lg">Payment Completed Successfully!</p>
          <p className="text-green-600 text-sm">Your order will be placed automatically.</p>
        </div>
      )}

      {/* UPI Payment Confirmation Dialog */}
      {showUPIConfirmation && !paymentCompleted && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-blue-900 mb-2">Payment with {selectedApp}</h4>
            <p className="text-sm text-blue-700 mb-4">
              Complete the payment of ₹{total.toFixed(2)} in {selectedApp} and return here to confirm.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleUPIPaymentComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={disabled}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Payment Completed
              </Button>
              <Button
                onClick={() => setShowUPIConfirmation(false)}
                variant="outline"
                disabled={disabled}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {!paymentCompleted && !showUPIConfirmation && (
        <>
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
                
                <Button
                  onClick={handleQRPaymentComplete}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={disabled}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Payment Completed
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentMethods;
