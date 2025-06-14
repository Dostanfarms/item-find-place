
import React from 'react';
import { Farmer } from '@/utils/types';

interface FarmerDetailsSectionProps {
  farmer: Farmer;
}

const FarmerDetailsSection: React.FC<FarmerDetailsSectionProps> = ({ farmer }) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">Farmer Details:</h4>
      <div className="space-y-3 p-4 border rounded-md bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground font-medium">Name:</span>
          <span className="font-medium">{farmer.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground font-medium">Phone:</span>
          <span>{farmer.phone}</span>
        </div>
        {farmer.email && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">Email:</span>
            <span className="text-sm">{farmer.email}</span>
          </div>
        )}
        {farmer.address && (
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground font-medium">Address:</span>
            <span className="text-sm text-right max-w-[200px]">{farmer.address}</span>
          </div>
        )}
        {farmer.village && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">Village:</span>
            <span className="text-sm">{farmer.village}</span>
          </div>
        )}
        {farmer.district && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">District:</span>
            <span className="text-sm">{farmer.district}</span>
          </div>
        )}
        {farmer.state && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">State:</span>
            <span className="text-sm">{farmer.state}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDetailsSection;
