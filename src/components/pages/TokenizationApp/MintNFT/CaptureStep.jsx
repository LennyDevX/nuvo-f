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
      className="space-y-4 sm:space-y-6"
    >
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold bg-nuvo-gradient-text bg-clip-text text-transparent mb-2">Capture Your Asset</h2>
        <p className="text-sm sm:text-base text-gray-300 px-4">Take a photo of your physical item or upload an existing image</p>
      </div>
      
      {/* Responsive video container - más transparente */}
      <div className="aspect-video sm:aspect-[4/3] lg:aspect-video bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden relative border border-white/20 shadow-lg">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Camera overlay with guidelines - responsive margins */}
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-500/40 m-2 sm:m-4 rounded"></div>
        
        {/* Camera indicators - responsive positioning */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse mr-1 sm:mr-2"></div>
          <span className="text-[10px] sm:text-xs text-white/70">LIVE</span>
        </div>
      </div>
      
      {/* Instructions - más sutil */}
      <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 text-center">
        <p className="text-xs sm:text-sm text-purple-300">
          <FaExclamationTriangle className="inline-block mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Position your item in the center of the frame for best results</span>
          <span className="sm:hidden">Center your item in the frame</span>
        </p>
      </div>
      
      {/* Action buttons - responsive layout */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium flex items-center justify-center gap-2 shadow-lg touch-manipulation"
          onClick={capturePhoto}
        >
          <FaCamera /> 
          <span className="text-sm sm:text-base">Take Photo</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto px-6 py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white font-medium flex items-center justify-center gap-2 touch-manipulation"
          onClick={() => fileInputRef.current?.click()}
        >
          <FaUpload /> 
          <span className="text-sm sm:text-base">Upload Image</span>
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