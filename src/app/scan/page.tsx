// Scan Page - QR Code and Receipt Scanner
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ScanLine,
  Camera,
  CameraOff,
  Receipt,
  QrCode,
  X,
  Upload,
  Check,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ScanMode = 'qr' | 'receipt';

export default function ScanPage() {
  const [mode, setMode] = useState<ScanMode>('qr');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Could not access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Capture image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);
      
      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      
      // Demo: Simulate QR code detection
      if (mode === 'qr') {
        setTimeout(() => {
          setScannedData('Demo QR Code: https://lunaris.app/pay?amount=500');
        }, 1000);
      } else {
        setTimeout(() => {
          setScannedData('Receipt captured! Amount detected: ৳1,250.00');
        }, 1000);
      }
      
      stopCamera();
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string);
      
      // Demo: Simulate processing
      setTimeout(() => {
        if (mode === 'qr') {
          setScannedData('Demo QR Code: https://lunaris.app/pay?amount=500');
        } else {
          setScannedData('Receipt scanned! Total: ৳1,250.00');
        }
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  // Reset scan
  const resetScan = () => {
    setCapturedImage(null);
    setScannedData(null);
    setCameraError(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <AppShell>
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-3">
            <ScanLine className="w-8 h-8 text-primary" />
            Scan
          </h1>
          <p className="text-muted-foreground mt-2">
            Scan QR codes or capture receipts to add transactions
          </p>
        </motion.div>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center gap-4"
        >
          <Button
            variant={mode === 'qr' ? 'default' : 'outline'}
            className="gap-2"
            onClick={() => { setMode('qr'); resetScan(); }}
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </Button>
          <Button
            variant={mode === 'receipt' ? 'default' : 'outline'}
            className="gap-2"
            onClick={() => { setMode('receipt'); resetScan(); }}
          >
            <Receipt className="w-4 h-4" />
            Receipt
          </Button>
        </motion.div>

        {/* Scanner Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="shadow-soft overflow-hidden">
            <CardContent className="p-0">
              {/* Camera/Image Preview Area */}
              <div className="relative aspect-[4/3] bg-muted flex items-center justify-center">
                {cameraActive && !capturedImage ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {/* Scan overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <motion.div
                        className="w-64 h-64 border-2 border-primary rounded-2xl"
                        animate={{
                          scale: [1, 1.02, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      <motion.div
                        className="absolute w-64 h-1 bg-primary/50"
                        animate={{
                          y: [-120, 120, -120],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    </div>
                    {/* Capture button */}
                    <Button
                      size="lg"
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 gap-2"
                      onClick={captureImage}
                    >
                      <Zap className="w-5 h-5" />
                      Capture
                    </Button>
                    {/* Close button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                      onClick={stopCamera}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </>
                ) : capturedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                    {scannedData && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute inset-0 bg-black/70 flex items-center justify-center"
                      >
                        <div className="text-center text-white p-6">
                          <Check className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                          <p className="text-lg font-medium mb-2">Scan Successful!</p>
                          <p className="text-sm opacity-80 mb-4">{scannedData}</p>
                          <Button onClick={resetScan} variant="secondary">
                            Scan Another
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : cameraError ? (
                  <div className="text-center p-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 mb-4">{cameraError}</p>
                    <Button variant="outline" onClick={startCamera}>
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      {mode === 'qr' ? (
                        <QrCode className="w-10 h-10 text-primary" />
                      ) : (
                        <Receipt className="w-10 h-10 text-primary" />
                      )}
                    </div>
                    <p className="text-muted-foreground mb-6">
                      {mode === 'qr' 
                        ? 'Position the QR code within the frame'
                        : 'Capture your receipt for automatic entry'
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button className="gap-2" onClick={startCamera}>
                        <Camera className="w-4 h-4" />
                        Open Camera
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                )}
              </div>
              
              {/* Hidden canvas for capturing */}
              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="shadow-soft bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                💡 Scanning Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {mode === 'qr' ? (
                <>
                  <p>• Ensure the QR code is well-lit and clearly visible</p>
                  <p>• Hold your phone steady for best results</p>
                  <p>• Scan payment QR codes to quickly add expense entries</p>
                </>
              ) : (
                <>
                  <p>• Flatten the receipt before scanning</p>
                  <p>• Ensure all text is visible within the frame</p>
                  <p>• Good lighting helps with accurate text detection</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
