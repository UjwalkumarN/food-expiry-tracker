import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, AlertCircle, Smartphone } from 'lucide-react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [simulatedScanProgress, setSimulatedScanProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Requesting camera access...');
  const [retryKey, setRetryKey] = useState(0);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [isScanningActive, setIsScanningActive] = useState(true);
  const [lastResult, setLastResult] = useState<string | null>(null);
  
  // Use a ref to keep the reader instance stable across renders
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStreamTracks = (stream?: MediaStream | null) => {
    stream?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  // Initialize Reader and Devices
  useEffect(() => {
    setIsSecureContext(window.isSecureContext || window.location.hostname === 'localhost');
    let mounted = true;
    const reader = new BrowserMultiFormatReader();
    codeReader.current = reader;

    const initCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera API is not supported in this browser.');
        setHasPermission(false);
        setIsInitializing(false);
        return;
      }

      try {
        setStatusMessage('Requesting camera access...');
        const constraints: MediaStreamConstraints = {
          video: { facingMode: { ideal: 'environment' } }
        };
        const tempStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = tempStream;
        if (!mounted) {
          stopStreamTracks(tempStream);
          return;
        }

        setStatusMessage('Preparing camera...');
        const devices = await reader.listVideoInputDevices();
        if (!mounted) return;

        setVideoDevices(devices);
        
        if (devices.length > 0) {
          // Try to find back camera or environment facing camera
          const backCamera = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('environment')
          );
          const preferredDevice = backCamera ? backCamera.deviceId : devices[0].deviceId;
          setSelectedDeviceId(preferredDevice);
          setHasPermission(true);
          setStatusMessage('Align barcode within the frame');
        } else {
          setHasPermission(false);
          setError("No camera devices found.");
          setStatusMessage('Connect a camera to continue.');
        }

        stopStreamTracks(tempStream);
      } catch (err) {
        console.error("Camera init error:", err);
        if (mounted) {
          setHasPermission(false);
          setError("Camera access denied or unavailable. Please allow access and try again.");
          setStatusMessage('Camera access blocked.');
        }
      } finally {
        if (mounted) setIsInitializing(false);
      }
    };

    initCamera();

    return () => {
      mounted = false;
      // Ensure we stop scanning when unmounting
      reader.reset();
      stopStreamTracks(streamRef.current);
    };
  }, [retryKey]);

  // Handle Scanning Logic
  useEffect(() => {
    if (!selectedDeviceId || !hasPermission || !videoRef.current || !codeReader.current || !isScanningActive) return;

    setStatusMessage('Scanning for barcode...');
    // Start decoding from the selected video device
    codeReader.current.decodeFromVideoDevice(
      selectedDeviceId,
      videoRef.current,
      (result, err) => {
        if (result && isScanningActive) {
          // Successfully scanned a barcode
          const scanned = result.getText();
          setLastResult(scanned);
          setIsScanningActive(false);
          setStatusMessage('Barcode detected!');
          stopStreamTracks(streamRef.current);
          codeReader.current?.reset();
          onScan(scanned);
        }
        // Note: ZXing throws NotFoundException continuously while scanning when no code is found.
        // We ignore these errors to avoid console spam.
        if (err && !(err instanceof NotFoundException)) {
           // Only log unexpected errors
           // console.warn("Scan error:", err);
        }
      }
    ).catch(err => {
      console.error("Stream start error:", err);
      setError("Failed to start video stream.");
      setStatusMessage('Unable to access selected camera.');
    });
  }, [selectedDeviceId, hasPermission, onScan, isScanningActive]);

  const handleRestartScanning = () => {
    setIsScanningActive(true);
    setLastResult(null);
    setStatusMessage('Scanning for barcode...');
    setRetryKey(prev => prev + 1);
  };

  const handleSimulateScan = () => {
    // Fallback simulation logic for demo or no-camera environments
    let progress = 0;
    const interval = setInterval(() => {
        progress += 20;
        setSimulatedScanProgress(progress);
        if (progress >= 100) {
            clearInterval(interval);
            const mockBarcodes = ['123456789', '987654321', '556677889', '998877665'];
            const randomCode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
            onScan(randomCode);
        }
    }, 200);
  };

  const handleRetry = () => {
    setError(null);
    setHasPermission(null);
    setStatusMessage('Requesting camera access...');
    setIsInitializing(true);
    setLastResult(null);
    setIsScanningActive(true);
    stopStreamTracks(streamRef.current);
    setRetryKey(prev => prev + 1);
  };

  const handleSwitchCamera = () => {
     if (videoDevices.length <= 1) return;
     const currentIndex = videoDevices.findIndex(d => d.deviceId === selectedDeviceId);
     const nextIndex = (currentIndex + 1) % videoDevices.length;
     setSelectedDeviceId(videoDevices[nextIndex].deviceId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-30 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white transition-colors backdrop-blur-md"
        >
            <X className="w-6 h-6" />
        </button>

        {/* Camera Feed */}
        {hasPermission && isSecureContext ? (
            <div className="relative w-full h-full">
                <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover"
                    muted // Important for autoplay policies on some browsers
                />
                
                <div className="absolute top-4 left-4 z-30 bg-black/60 text-white px-4 py-2 rounded-full text-xs font-medium backdrop-blur">
                  {statusMessage}{isInitializing ? ' (initializing...)' : ''}
                </div>

                {/* Visual Overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-64 h-48 border-2 border-white/50 rounded-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-500 -mt-0.5 -ml-0.5 rounded-tl"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-500 -mt-0.5 -mr-0.5 rounded-tr"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-500 -mb-0.5 -ml-0.5 rounded-bl"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-500 -mb-0.5 -mr-0.5 rounded-br"></div>
                        
                        {/* Laser scanning animation */}
                        <div className="w-full h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[scan_2s_infinite]"></div>
                    </div>
                    <p className="mt-6 text-white font-medium bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm text-sm">
                        Align barcode within frame
                    </p>
                </div>
                
                {/* Camera Switcher Button */}
                {videoDevices.length > 1 && (
                     <button 
                        onClick={handleSwitchCamera}
                        className="absolute bottom-6 right-6 z-30 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md transition-colors"
                        title="Switch Camera"
                     >
                         <Smartphone className="w-6 h-6" />
                     </button>
                )}
            </div>
        ) : (
             /* Error / Fallback State */
            <div className="flex flex-col items-center justify-center h-full text-white p-8 text-center bg-slate-900 space-y-6">
                <div className="bg-slate-800 p-6 rounded-full mb-6">
                    <Camera className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Scanner Unavailable</h3>
                <p className="text-slate-400 mb-8 max-w-xs">
                    {!isSecureContext
                      ? "Camera access requires a secure origin (https or http://localhost). Please run the app locally via npm run dev."
                      : (error || "We couldn't access your camera. Please ensure permissions are granted.")}
                </p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm transition"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Camera Access
                </button>
                {!isSecureContext && (
                  <p className="text-xs text-slate-500 max-w-sm">
                    Tip: Browsers block camera usage on plain file URLs. Use the Vite dev server (e.g., http://localhost:3000) or deploy over HTTPS.
                  </p>
                )}
             </div>
        )}
        
        {/* Manual Fallback / Simulation Button */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3 z-30 pointer-events-auto">
            {lastResult && (
              <div className="text-sm text-white bg-black/50 px-4 py-2 rounded-full">
                Last scan: <span className="font-semibold">{lastResult}</span>
                <button
                  onClick={handleRestartScanning}
                  className="ml-3 text-brand-200 hover:text-white underline text-xs"
                >
                  Scan again
                </button>
              </div>
            )}
            <button 
                onClick={handleSimulateScan}
                disabled={simulatedScanProgress > 0}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-full shadow-lg font-medium flex items-center gap-2 transition-all active:scale-95 border border-brand-500/50"
            >
                {simulatedScanProgress > 0 ? (
                        <>Scanning... {simulatedScanProgress}%</>
                ) : (
                        <><RefreshCw className="w-5 h-5" /> Simulate Scan (Demo)</>
                )}
            </button>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
            0% { transform: translateY(0); opacity: 0; }
            10% { opacity: 1; }
            50% { transform: translateY(192px); }
            90% { opacity: 1; }
            100% { transform: translateY(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;