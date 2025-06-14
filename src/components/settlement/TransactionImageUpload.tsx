
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
    <div className="flex items-center">
      <PhotoUploadField
        value={transactionImage}
        onChange={onImageChange}
        name="transaction-image"
        className="w-12 h-12"
      />
    </div>
  );
};

export default TransactionImageUpload;
