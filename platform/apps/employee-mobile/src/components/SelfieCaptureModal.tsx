import { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, RefreshCw } from 'lucide-react';

interface SelfieCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export default function SelfieCaptureModal({ isOpen, onClose, onCapture }: SelfieCaptureModalProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setPhoto(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError('Camera access not supported on this browser/environment.');
      }
    } catch (err: any) {
      console.warn('Camera error, allowing upload fallback:', err);
      setCameraError('Camera permission denied or camera unavailable. You can upload or continue with simulated photo.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSnap = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(dataUrl);
        stopCamera();
      }
    } else {
      // Fallback simulated photo
      const sample = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&crop=faces';
      setPhoto(sample);
    }
  };

  const handleConfirm = () => {
    if (photo) {
      onCapture(photo);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X size={18} />
        </button>

        <div>
          <h3 className="text-base font-bold text-slate-900">Duty Selfie Verification</h3>
          <p className="text-xs text-slate-500 mt-0.5">Please align your face inside the circle</p>
        </div>

        {/* Viewfinder or Captured Photo */}
        <div className="w-56 h-56 mx-auto rounded-full overflow-hidden border-4 border-[#1A2B79] shadow-xl relative bg-slate-900 flex items-center justify-center">
          {photo ? (
            <img src={photo} alt="Duty Selfie" className="w-full h-full object-cover" />
          ) : cameraActive ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
          ) : (
            <div className="text-center p-4 text-slate-400 text-xs space-y-2">
              <Camera size={36} className="mx-auto text-slate-500" />
              <p>{cameraError || 'Initializing camera...'}</p>
              <button
                type="button"
                onClick={handleSnap}
                className="px-3 py-1 bg-slate-800 text-slate-200 rounded-lg text-[10px] font-bold"
              >
                Use Sample Verification
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex justify-center gap-3">
          {photo ? (
            <>
              <button
                onClick={() => {
                  setPhoto(null);
                  startCamera();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                <RefreshCw size={13} /> Retake
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
              >
                <Check size={14} /> Confirm & Punch
              </button>
            </>
          ) : (
            <button
              onClick={handleSnap}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1A2B79] hover:bg-[#14215e] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Camera size={15} /> Capture Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

