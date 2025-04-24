import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaUpload, FaExclamationTriangle } from 'react-icons/fa';
import { useTokenization } from '../../../../context/TokenizationContext';

const CaptureStep = () => {
  const {
    setCurrentStep,
    setImage,
    setImageFile,
    videoRef,
    canvasRef,
    streamRef,
    fileInputRef
  } = useTokenization();

  // Camera handling
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  }, [videoRef, streamRef]);
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [streamRef]);
  
  // When component mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);
  
  // Take photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      canvas.toBlob(blob => {
        setImage(URL.createObjectURL(blob));
        setImageFile(blob);
        setCurrentStep('metadata');
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };
  
  // File upload handling
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setCurrentStep('metadata');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold bg-nuvo-gradient-text text-center">Capture Your Asset</h2>
      <p className="text-gray-300 text-center">Take a photo of your physical item or upload an existing image</p>
      
      <div className="aspect-video bg-black/20 rounded-xl overflow-hidden relative border border-purple-500/30 shadow-lg">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Camera overlay with guidelines */}
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-500/40 m-4 rounded"></div>
        
        {/* Camera indicators */}
        <div className="absolute top-3 left-3 flex items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
          <span className="text-xs text-white/70">LIVE</span>
        </div>
      </div>
      
      <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20 text-center">
        <p className="text-sm text-purple-300">
          <FaExclamationTriangle className="inline-block mr-2" />
          Position your item in the center of the frame for best results
        </p>
      </div>
      
      <div className="flex justify-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg"
          onClick={capturePhoto}
        >
          <FaCamera /> Take Photo
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white font-medium flex items-center gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <FaUpload /> Upload Image
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CaptureStep;
