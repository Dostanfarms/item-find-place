import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw, ShieldCheck, Camera } from "lucide-react";

interface FaceCaptureModalProps {
  open: boolean;
  onClose: () => void;
  /** descriptor kept for API compatibility; always [] (Azure handles matching server-side) */
  onCapture: (descriptor: number[], imageDataUrl: string) => void;
  title?: string;
  mode?: "enroll" | "verify";
}

type Phase = "loading" | "ready" | "countdown" | "captured" | "error";

const FaceCaptureModal = ({ open, onClose, onCapture, mode = "enroll" }: FaceCaptureModalProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [message, setMessage] = useState("Initializing camera...");
  const [count, setCount] = useState(3);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [resetTick, setResetTick] = useState(0);
  const capturedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    capturedRef.current = false;
    setPhase("loading");
    setMessage("Initializing camera...");
    setCount(3);
    setPermissionError(null);
  }, [open, resetTick]);

  const handleUserMedia = useCallback(() => {
    setPhase("ready");
    setMessage("Center your face in the circle and hold still");
    // Auto start countdown after a short stabilisation delay
    setTimeout(() => {
      if (capturedRef.current) return;
      setPhase("countdown");
    }, 1200);
  }, []);

  // Countdown then capture
  useEffect(() => {
    if (phase !== "countdown") return;
    setCount(3);
    setMessage("Hold still — capturing in 3");
    let n = 3;
    const id = setInterval(() => {
      n -= 1;
      if (n > 0) {
        setCount(n);
        setMessage(`Hold still — capturing in ${n}`);
      } else {
        clearInterval(id);
        const snapshot = webcamRef.current?.getScreenshot() || "";
        if (!snapshot) {
          setPhase("error");
          setMessage("Failed to capture image. Please retry.");
          return;
        }
        capturedRef.current = true;
        setPhase("captured");
        setMessage(mode === "enroll" ? "Captured. Verifying quality..." : "Captured. Verifying identity...");
        onCapture([], snapshot);
        setTimeout(() => onClose(), 400);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, mode, onCapture, onClose]);

  const handleRetry = () => {
    capturedRef.current = false;
    setResetTick((t) => t + 1);
  };

  const handleUserMediaError = (err: string | DOMException) => {
    const msg = typeof err === "string" ? err : err.message;
    setPermissionError("Camera access denied: " + msg);
    setPhase("error");
  };

  const ringColor =
    phase === "captured"
      ? "stroke-green-500"
      : phase === "countdown"
      ? "stroke-blue-500"
      : phase === "error"
      ? "stroke-red-500"
      : "stroke-amber-400";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
            {mode === "enroll" ? "Azure Face Enrollment" : "Azure Face Login"}
          </DialogTitle>
        </DialogHeader>
        <div className="relative bg-black aspect-square w-full">
          {permissionError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center gap-3">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <p className="text-sm">{permissionError}</p>
            </div>
          ) : (
            <>
              <Webcam
                key={resetTick}
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.92}
                videoConstraints={{ facingMode: "user", width: 720, height: 720 }}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                mirrored
                className="absolute inset-0 w-full h-full object-cover"
              />
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <mask id="oval-mask">
                    <rect width="100" height="100" fill="white" />
                    <ellipse cx="50" cy="50" rx="32" ry="38" fill="black" />
                  </mask>
                </defs>
                <rect width="100" height="100" fill="black" fillOpacity="0.5" mask="url(#oval-mask)" />
                <ellipse
                  cx="50" cy="50" rx="32" ry="38"
                  className={`${ringColor} transition-colors duration-200`}
                  fill="none"
                  strokeWidth="1"
                />
              </svg>

              {phase === "countdown" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-7xl font-bold drop-shadow-lg">{count}</span>
                </div>
              )}

              {phase === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 className="h-10 w-10 animate-spin text-white" />
                </div>
              )}
            </>
          )}
        </div>
        <div className="px-4 py-3 space-y-3">
          <div
            className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold tracking-wide shadow-sm ${
              phase === "captured"
                ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                : phase === "countdown"
                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                : phase === "error"
                ? "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
            }`}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
          {phase === "error" ? (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" /> Retry
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              {phase === "ready" && (
                <Button className="flex-1" onClick={() => setPhase("countdown")}>
                  <Camera className="h-4 w-4 mr-2" /> Capture now
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FaceCaptureModal;

// Backwards-compat stub; Azure handles verification server-side.
export function faceDistance(_a: number[], _b: number[]): number {
  return Infinity;
}
