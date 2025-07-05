
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
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [scanningActive, setScanningActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  
  const { isNative, takePicture, vibrate } = useNativeFeatures();

  // Initialize ZXing code reader with enhanced settings
  useEffect(() => {
    if (!isNative && !codeReader.current) {
      codeReader.current = new BrowserMultiFormatReader();
      // Configure hints for better detection
      const hints = new Map();
      hints.set(2, true); // ASSUME_GS1
      hints.set(3, true); // ASSUME_CODE_39_CHECK_DIGIT
      codeReader.current.setHints(hints);
    }
    
    return () => {
      cleanup();
    };
  }, [isNative]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
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
    
    setScanningActive(false);
    setScanning(false);
    setFlashlightOn(false);
  }, []);

  // Play success sound and vibrate
  const playSuccessSound = async () => {
    try {
      // Vibrate on mobile
      await vibrate();
      
      // Play beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio/vibration not available');
    }
  };

  // Enhanced camera initialization
  const startCamera = async () => {
    try {
      setScanning(true);
      setCameraError('');
      
      if (isNative) {
        // Use native camera for mobile
        const imageDataUrl = await takePicture();
        console.log('Captured image for barcode scanning');
        // Simulate processing for demo
        setTimeout(() => {
          const mockBarcode = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-13);
          handleBarcodeDetected(mockBarcode);
        }, 1500);
        return;
      }

      // Enhanced web camera constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          focusMode: 'continuous',
          exposureMode: 'continuous',
          whiteBalanceMode: 'continuous'
        } as any
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        
        // Check for flashlight support
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        setHasFlashlight('torch' in capabilities);
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });
        
        await videoRef.current.play();
        setScanningActive(true);
        startContinuousScanning();
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      handleCameraError(error);
    }
  };

  // Enhanced continuous scanning
  const startContinuousScanning = () => {
    if (!codeReader.current || !videoRef.current || !scanningActive) return;
    
    const scanFrame = async () => {
      if (!scanningActive || !videoRef.current || !codeReader.current) return;
      
      try {
        const result = await codeReader.current.decodeFromVideoElement(videoRef.current);
        if (result) {
          const now = Date.now();
          const code = result.getText();
          
          // Prevent duplicate scans within 2 seconds
          if (code !== lastScannedCode || now - lastScanTimeRef.current > 2000) {
            setLastScannedCode(code);
            lastScanTimeRef.current = now;
            handleBarcodeDetected(code);
            return;
          }
        }
      } catch (error) {
        // Ignore common scanning errors and continue
        if (!(error instanceof NotFoundException) && 
            !(error instanceof ChecksumException) && 
            !(error instanceof FormatException)) {
          console.error('Scanning error:', error);
        }
      }
      
      // Continue scanning if still active
      if (scanningActive) {
        requestAnimationFrame(scanFrame);
      }
    };
    
    // Start scanning loop
    requestAnimationFrame(scanFrame);
  };

  // Handle camera errors
  const handleCameraError = (error: any) => {
    let errorMessage = 'Unable to access camera. ';
    
    if (error.name === 'NotAllowedError') {
      errorMessage += 'Please allow camera permissions and try again.';
    } else if (error.name === 'NotFoundError') {
      errorMessage += 'No camera found on this device.';
    } else if (error.name === 'NotReadableError') {
      errorMessage += 'Camera is being used by another application.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage += 'Camera does not meet the required specifications.';
    } else {
      errorMessage += 'Please try manual entry below.';
    }
    
    setCameraError(errorMessage);
    setScanning(false);
    setScanningActive(false);
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
      console.error('Error toggling flashlight:', error);
    }
  };

  // Handle successful barcode detection
  const handleBarcodeDetected = async (barcode: string) => {
    console.log('Barcode detected:', barcode);
    setScanningActive(false);
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
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent text-white z-20">
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

      {/* Full Screen Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {!isNative && !cameraError && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            playsInline
            muted
            style={{ transform: 'scaleX(-1)' }}
          />
        )}

        {/* Native Camera Placeholder */}
        {isNative && (
          <div className="flex items-center justify-center h-full text-center text-white bg-gray-900">
            <div className="p-8">
              <ScanBarcode className="h-32 w-32 mx-auto mb-6 text-green-500" />
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

        {/* Camera Error */}
        {cameraError && (
          <div className="flex items-center justify-center h-full text-center text-white bg-gray-900 p-6">
            <div>
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <p className="text-xl mb-4 text-red-300">{cameraError}</p>
              <Button
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Scanning Frame Overlay */}
        {scanningActive && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Scanning Rectangle */}
            <div className="relative">
              <div className="w-64 h-40 border-2 border-green-500 rounded-lg relative overflow-hidden">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                
                {/* Scanning line animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="w-full h-0.5 bg-green-400 animate-pulse relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="text-center mt-4">
                <p className="text-white text-lg font-medium">Position barcode in the frame</p>
                <p className="text-white/80 text-sm">Hold steady for automatic scanning</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-20">
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
