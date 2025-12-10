import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, X, AlertCircle } from 'lucide-react';

function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannedCodesRef = useRef(new Set());

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setError('Unable to access camera. Please check permissions.');
        setIsScanning(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isScanning) return;

    const scanQR = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          const data = code.data;
          
          // Prevent duplicate scans within 2 seconds
          if (!scannedCodesRef.current.has(data)) {
            scannedCodesRef.current.add(data);
            onScan(data);
            
            // Remove from set after 2 seconds to allow re-scan
            setTimeout(() => {
              scannedCodesRef.current.delete(data);
            }, 2000);
          }
        }
      }

      if (isScanning) {
        requestAnimationFrame(scanQR);
      }
    };

    const frameId = requestAnimationFrame(scanQR);
    return () => cancelAnimationFrame(frameId);
  }, [isScanning, onScan]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Scan QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <p className="text-xs text-red-700 mt-1">
                Please grant camera permissions and try again.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '1' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* QR Frame Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-green-400 rounded-lg" />
              </div>

              {/* Scanning indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg">
                <Camera className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Scanning...</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center">
              Point your camera at a QR code to scan it
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default QRScanner;
