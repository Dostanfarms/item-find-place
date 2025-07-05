
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ScanBarcode, Camera, AlertCircle } from 'lucide-react';
import { useNativeFeatures } from '@/hooks/useNativeFeatures';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const { isNative, takePicture } = useNativeFeatures();

  // Initialize ZXing code reader
  useEffect(() => {
    if (!isNative) {
      codeReader.current = new BrowserMultiFormatReader();
    }
    
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, [isNative]);

  // Play beep sound when barcode is detected
  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio context not available');
    }
  };

  const startCamera = async () => {
    try {
      setScanning(true);
      setCameraError('');
      
      if (isNative) {
        // Use native camera for mobile
        const imageDataUrl = await takePicture();
        console.log('Captured image for barcode scanning');
        // Simulate processing delay
        setTimeout(() => {
          const mockBarcode = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-13);
          handleBarcodeDetected(mockBarcode);
        }, 1500);
      } else {
        // Use ZXing for web camera
        if (codeReader.current && videoRef.current) {
          try {
            const result = await codeReader.current.decodeFromVideoDevice(
              undefined, 
              videoRef.current, 
              (result, error) => {
                if (result) {
                  handleBarcodeDetected(result.getText());
                }
                if (error && !(error instanceof NotFoundException)) {
                  console.error('Barcode scan error:', error);
                }
              }
            );
          } catch (error: any) {
            console.error('Error starting camera:', error);
            setCameraError('Unable to access camera. Please check permissions.');
            setScanning(false);
          }
        }
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.';
      } else {
        errorMessage += 'Please try manual entry below.';
      }
      
      setCameraError(errorMessage);
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setScanning(false);
  };

  const handleBarcodeDetected = (barcode: string) => {
    console.log('Barcode detected:', barcode);
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
    if (isOpen) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Handle ESC key to close scanner
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header - Minimal */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-black bg-opacity-50 text-white z-20">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ScanBarcode className="h-5 w-5" />
          Scan Barcode
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Full Screen Camera */}
      <div className="flex-1 relative">
        {!isNative && !cameraError && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        )}

        {isNative && (
          <div className="flex items-center justify-center h-full text-center text-white bg-gray-900">
            <div className="p-8">
              <Camera className="h-32 w-32 mx-auto mb-6 text-green-500" />
              <p className="text-2xl mb-4">Ready to scan barcode</p>
              <Button
                onClick={startCamera}
                disabled={scanning}
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
              >
                {scanning ? 'Processing...' : 'Open Camera'}
              </Button>
            </div>
          </div>
        )}

        {cameraError && (
          <div className="flex items-center justify-center h-full text-center text-white bg-gray-900 p-6">
            <div>
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <p className="text-xl mb-4 text-red-300">{cameraError}</p>
              <Button
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700 mr-4"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Scanning indicator - Center of screen */}
        {scanning && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white text-center">
              <div className="animate-pulse mb-2">
                <div className="w-64 h-1 bg-green-500 mx-auto"></div>
              </div>
              <p className="text-lg">Position barcode in front of camera</p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 p-4 z-20">
        <div className="max-w-md mx-auto">
          <p className="text-white text-center mb-3 text-sm">Or enter barcode manually:</p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode number"
              className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-green-500 focus:outline-none"
            />
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-4 py-2"
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
