
import React from 'react';
import { Upload } from 'lucide-react';
import PhotoUploadField from '@/components/PhotoUploadField';

interface TransactionImageUploadProps {
  transactionImage: string;
  onImageChange: (value: string) => void;
}

const TransactionImageUpload: React.FC<TransactionImageUploadProps> = ({ 
  transactionImage, 
  onImageChange 
}) => {
  return (
    <div className="flex-shrink-0 p-4 border-t bg-gray-50">
      <h4 className="text-sm font-medium mb-3">Upload Transaction Proof:</h4>
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
        <PhotoUploadField
          value={transactionImage}
          onChange={onImageChange}
          name="transaction-image"
          className="w-20 h-20 mb-2"
        />
        {!transactionImage ? (
          <div className="text-center">
            <Upload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
            <p className="text-xs text-muted-foreground">
              Upload transaction receipt
            </p>
            <p className="text-xs text-red-500 mt-1">
              Required before settling
            </p>
          </div>
        ) : (
          <p className="text-xs text-green-600">
            ✓ Transaction image uploaded
          </p>
        )}
      </div>
    </div>
  );
};

export default TransactionImageUpload;
