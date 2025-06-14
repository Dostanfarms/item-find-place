
import React from 'react';
import { Farmer } from '@/utils/types';

interface BankDetailsSectionProps {
  farmer: Farmer;
}

const BankDetailsSection: React.FC<BankDetailsSectionProps> = ({ farmer }) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">Payment will be sent to:</h4>
      <div className="space-y-3 p-4 border rounded-md bg-blue-50">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground font-medium">Account Holder:</span>
          <span className="font-medium">{farmer.name}</span>
        </div>
        {farmer.bank_name && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">Bank:</span>
            <span>{farmer.bank_name}</span>
          </div>
        )}
        {farmer.account_number && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">Account Number:</span>
            <span className="font-mono">{farmer.account_number}</span>
          </div>
        )}
        {farmer.ifsc_code && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">IFSC Code:</span>
            <span className="font-mono">{farmer.ifsc_code}</span>
          </div>
        )}
        {(!farmer.bank_name || !farmer.account_number) && (
          <div className="text-center py-2">
            <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
              Incomplete bank details - Please verify with farmer
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankDetailsSection;
