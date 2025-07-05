
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ScanBarcode, Camera } from 'lucide-react';
import { useNativeFeatures } from '@/hooks/useNativeFeatures';

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
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<any>(null);
  const { isNative, takePicture } = useNativeFeatures();

  // Play beep sound
  const playBeep = () => {
    try {
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
        console.log('Captured image for barcode scanning:', imageDataUrl);
        // In a real implementation, you would process the image to extract barcode
        // For now, we'll simulate a successful scan after a delay
        setTimeout(() => {
          const mockBarcode = `GEN${Date.now()}${Math.floor(Math.random() * 1000)}`;
          handleBarcodeDetected(mockBarcode);
        }, 2000);
      } else {
        // Use web camera with better constraints
        const constraints = {
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 16/9 }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          
          // Start barcode detection simulation
          startBarcodeDetection();
        }
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else {
        errorMessage += 'Please try manual entry.';
      }
      
      setCameraError(errorMessage);
      setScanning(false);
    }
  };

  const startBarcodeDetection = () => {
    // Simulate barcode detection - in a real app, you'd use a barcode detection library
    // like QuaggaJS or ZXing
    const detectBarcode = () => {
      if (videoRef.current && streamRef.current) {
        // This is a simulation - randomly generate a barcode after some time
        const random = Math.random();
        if (random > 0.98) { // 2% chance per check to simulate finding a barcode
          const mockBarcode = `SCAN${Date.now()}${Math.floor(Math.random() * 1000)}`;
          handleBarcodeDetected(mockBarcode);
          return;
        }
        
        // Continue scanning
        if (scanning) {
          setTimeout(detectBarcode, 100);
        }
      }
    };
    
    setTimeout(detectBarcode, 1000);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scannerRef.current) {
      scannerRef.current = null;
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
    if (isOpen) {
      // Auto-start camera when scanner opens
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white relative z-10">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ScanBarcode className="h-6 w-6" />
          Scan Barcode
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-gray-800"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Full Screen Scanner Area */}
      <div className="flex-1 relative overflow-hidden">
        {!isNative && !cameraError && (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Full Screen Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              
              {/* Large Scanning frame covering most of the screen */}
              <div className="relative z-10 w-11/12 h-4/5 max-w-4xl max-h-96">
                <div className="w-full h-full border-4 border-white rounded-3xl relative bg-transparent">
                  {/* Large Corner indicators */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 border-t-6 border-l-6 border-green-500 rounded-tl-3xl"></div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 border-t-6 border-r-6 border-green-500 rounded-tr-3xl"></div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 border-b-6 border-l-6 border-green-500 rounded-bl-3xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b-6 border-r-6 border-green-500 rounded-br-3xl"></div>
                  
                  {/* Large Scanning line animation */}
                  <div className="absolute inset-8 overflow-hidden rounded-2xl">
                    <div className="w-full h-2 bg-green-500 opacity-75 animate-pulse"></div>
                  </div>
                </div>
                
                <p className="text-white text-center mt-8 text-2xl font-medium">
                  Position barcode within the frame
                </p>
                {scanning && (
                  <p className="text-green-400 text-center mt-4 text-lg animate-pulse">
                    Scanning...
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {isNative && (
          <div className="flex items-center justify-center h-full text-center text-white">
            <div>
              <Camera className="h-32 w-32 mx-auto mb-6 text-green-500" />
              <p className="text-2xl mb-4">Tap to scan with camera</p>
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
          <div className="flex items-center justify-center h-full text-center text-white p-6">
            <div>
              <X className="h-16 w-16 mx-auto mb-4 text-red-500" />
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
      </div>

      {/* Manual Entry Section - Fixed at bottom */}
      <div className="bg-black bg-opacity-90 p-6 relative z-10">
        <div className="max-w-md mx-auto">
          <p className="text-white text-center mb-4 text-lg">Or enter barcode manually:</p>
          <form onSubmit={handleManualSubmit} className="flex gap-3">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode number"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-green-500 focus:outline-none text-lg"
            />
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-6 py-3 text-lg"
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
