import React, { useRef, useCallback } from 'react';
import { FaImage } from 'react-icons/fa';

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

const ImageUpload = ({ selectedImage, setSelectedImage, isDisabled }) => {
    const fileInputRef = useRef(null);

    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) return;
            if (file.size > MAX_IMAGE_SIZE) {
                alert('La imagen es demasiado grande (máx 4MB). Usa una imagen más pequeña.');
                return;
            }
            setSelectedImage(file);
        }
    }, [setSelectedImage]);

    const handleRemoveImage = useCallback(() => {
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [setSelectedImage]);

    return (
        <>
            <button
                type="button"
                className="
                  flex items-center justify-center
                  w-12 h-12 md:w-10 md:h-10 rounded-xl
                  bg-gray-500/30 hover:bg-gray-600 text-gray-300 hover:text-white
                  border-2 border-purple-800/20 hover:border-purple-500/50
                  transition-all duration-200 ease-out
                  shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                  touch-manipulation
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
                "
                aria-label="Upload image"
                onClick={() => fileInputRef.current?.click()}
                disabled={isDisabled}
            >
                <FaImage className="w-5 h-5" />
            </button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
            />

            {selectedImage && (
                <div className="relative flex items-center ml-2">
                    <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="preview"
                        className="w-12 h-12 object-cover rounded-xl border border-purple-500/30 shadow"
                    />
                    <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        onClick={handleRemoveImage}
                        aria-label="Remove image"
                    >×</button>
                </div>
            )}
        </>
    );
};

export default ImageUpload;
