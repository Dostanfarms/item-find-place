
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ScanBarcode } from 'lucide-react';
import { useNativeFeatures } from '@/hooks/useNativeFeatures';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { isNative, takePicture } = useNativeFeatures();

  // Play beep sound
  const playBeep = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const startCamera = async () => {
    try {
      setScanning(true);
      
      if (isNative) {
        // Use native camera for mobile
        const imageDataUrl = await takePicture();
        console.log('Captured image for barcode scanning:', imageDataUrl);
        // In a real implementation, you would process the image to extract barcode
        // For now, we'll simulate a successful scan
        setTimeout(() => {
          const mockBarcode = `GEN${Date.now()}${Math.floor(Math.random() * 1000)}`;
          handleBarcodeDetected(mockBarcode);
        }, 1000);
      } else {
        // Use web camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleBarcodeDetected = (barcode: string) => {
    playBeep();
    onScan(barcode);
    stopCamera();
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleBarcodeDetected(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  useEffect(() => {
    if (isOpen && !isNative) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <h2 className="text-lg font-semibold">Scan Barcode</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {!isNative && (
          <div className="relative w-full max-w-md aspect-square bg-gray-900 rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 border-2 border-green-500 rounded-lg">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isNative && (
          <div className="text-center text-white mb-6">
            <ScanBarcode className="h-24 w-24 mx-auto mb-4 text-green-500" />
            <p className="text-lg">Tap the button below to scan</p>
            <Button
              onClick={startCamera}
              disabled={scanning}
              className="mt-4 bg-green-600 hover:bg-green-700"
            >
              {scanning ? 'Processing...' : 'Start Camera Scan'}
            </Button>
          </div>
        )}

        {/* Manual Entry */}
        <div className="w-full max-w-md">
          <p className="text-white text-center mb-4">Or enter barcode manually:</p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode"
              className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
            />
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
            >
              Add
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
