
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, ScanBarcode, Flashlight, FlashlightOff, AlertCircle } from 'lucide-react';
import { useNativeFeatures } from '@/hooks/useNativeFeatures';
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [hasFlashlight, setHasFlashlight] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef<boolean>(false);
  
  const { isNative, takePicture, vibrate } = useNativeFeatures();

  // Initialize ZXing code reader
  useEffect(() => {
    if (!isNative) {
      codeReader.current = new BrowserMultiFormatReader();
    }
    
    return () => {
      cleanup();
    };
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    scanningRef.current = false;
    setScanning(false);
    
    if (codeReader.current) {
      try {
        codeReader.current.reset();
      } catch (error) {
        console.log('Error resetting code reader:', error);
      }
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    setFlashlightOn(false);
  }, []);

  // Play success sound and vibrate
  const playSuccessSound = async () => {
    try {
      await vibrate();
      
      // Simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.log('Audio/vibration not available');
    }
  };

  // Start camera with optimized settings
  const startCamera = async () => {
    try {
      setScanning(true);
      setCameraError('');
      
      if (isNative) {
        const imageDataUrl = await takePicture();
        console.log('Captured image for barcode scanning');
        // Mock processing for native
        setTimeout(() => {
          const mockBarcode = `MOCK${Date.now()}`.slice(-13);
          handleBarcodeDetected(mockBarcode);
        }, 1000);
        return;
      }

      // Optimized camera constraints for barcode scanning
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        
        // Check for flashlight support
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        setHasFlashlight('torch' in capabilities);
        
        // Wait for video to load and start scanning
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              startScanning();
            });
          }
        };
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      handleCameraError(error);
    }
  };

  // Optimized scanning function
  const startScanning = () => {
    if (!codeReader.current || !videoRef.current) return;
    
    scanningRef.current = true;
    
    const scanLoop = async () => {
      if (!scanningRef.current || !videoRef.current || !codeReader.current) return;
      
      try {
        const result = await codeReader.current.decodeFromVideoElement(videoRef.current);
        if (result && result.getText()) {
          const barcode = result.getText();
          console.log('Barcode detected:', barcode);
          handleBarcodeDetected(barcode);
          return;
        }
      } catch (error) {
        // Continue scanning on common errors
        if (!(error instanceof NotFoundException) && 
            !(error instanceof ChecksumException) && 
            !(error instanceof FormatException)) {
          console.error('Scanning error:', error);
        }
      }
      
      // Continue scanning
      if (scanningRef.current) {
        setTimeout(scanLoop, 100); // Scan every 100ms
      }
    };
    
    scanLoop();
  };

  // Handle camera errors
  const handleCameraError = (error: any) => {
    let errorMessage = 'Camera access failed. ';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Please allow camera permissions and refresh the page.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera found on this device.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Camera is being used by another application.';
    } else {
      errorMessage = 'Unable to access camera. Please try manual entry.';
    }
    
    setCameraError(errorMessage);
    setScanning(false);
  };

  // Toggle flashlight
  const toggleFlashlight = async () => {
    if (!streamRef.current || !hasFlashlight) return;
    
    try {
      const track = streamRef.current.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: !flashlightOn } as any]
      });
      setFlashlightOn(!flashlightOn);
    } catch (error) {
      console.error('Flashlight error:', error);
    }
  };

  // Handle successful barcode detection
  const handleBarcodeDetected = async (barcode: string) => {
    scanningRef.current = false;
    await playSuccessSound();
    onScan(barcode);
    cleanup();
    onClose();
  };

  // Handle manual barcode entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleBarcodeDetected(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  // Start camera when scanner opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      cleanup();
    }
    
    return cleanup;
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        cleanup();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-black/80 text-white z-20">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ScanBarcode className="h-5 w-5" />
          Scan Barcode
        </h2>
        <div className="flex items-center gap-2">
          {hasFlashlight && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFlashlight}
              className="text-white hover:bg-white/20"
            >
              {flashlightOn ? (
                <FlashlightOff className="h-5 w-5" />
              ) : (
                <Flashlight className="h-5 w-5" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Full Screen Video */}
      <div className="absolute inset-0">
        {!isNative && !cameraError && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        )}

        {/* Native Camera View */}
        {isNative && (
          <div className="flex items-center justify-center h-full text-center text-white bg-gray-900">
            <div className="p-8">
              <ScanBarcode className="h-32 w-32 mx-auto mb-6 text-green-500" />
              <p className="text-2xl mb-4">Ready to scan</p>
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

        {/* Camera Error */}
        {cameraError && (
          <div className="flex items-center justify-center h-full text-center text-white bg-gray-900 p-6">
            <div>
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <p className="text-xl mb-4 text-red-300">{cameraError}</p>
              <Button
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700 mb-4"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Scanning Overlay */}
        {scanning && !cameraError && !isNative && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              {/* Scanning Rectangle */}
              <div className="w-80 h-48 border-4 border-green-400 rounded-lg relative">
                {/* Corner indicators */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                
                {/* Scanning line */}
                <div className="absolute inset-x-0 top-1/2 h-1 bg-green-400 animate-pulse"></div>
              </div>
              
              {/* Instructions */}
              <div className="text-center mt-6">
                <p className="text-white text-lg font-medium">Position barcode inside the frame</p>
                <p className="text-white/80 text-sm mt-1">Scanning automatically...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-4 z-20">
        <div className="max-w-md mx-auto">
          <p className="text-white text-center mb-3 text-sm">Can't scan? Enter manually:</p>
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
