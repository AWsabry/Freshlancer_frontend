import React, { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cropper from 'react-easy-crop';
import { authService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import { translateError } from '../../utils/errorTranslations';
import Modal from './Modal';
import Button from './Button';
import { Upload, X } from 'lucide-react';
import { API_BASE_URL } from '../../config/env';

const translations = {
  en: {
    changePhoto: 'Change Photo',
    uploadPhoto: 'Upload Photo',
    photoUploaded: 'Photo uploaded successfully!',
    photoUploadFailed: 'Failed to upload photo',
    selectPhoto: 'Select a photo',
    photoSupportedFormats: 'Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)',
    cropPhoto: 'Crop Photo',
    cropPhotoDescription: 'Adjust the image to your desired size and position',
    saveCrop: 'Save & Upload',
    fileSizeError: 'File size must be less than 5MB',
    fileReadError: 'Error reading file. Please try again.',
    adjustCropError: 'Please adjust the crop area before saving.',
    cropSizeError: 'File size must be less than 5MB. Please try cropping a smaller area.',
    cancel: 'Cancel',
  },
  it: {
    changePhoto: 'Cambia Foto',
    uploadPhoto: 'Carica Foto',
    photoUploaded: 'Foto caricata con successo!',
    photoUploadFailed: 'Impossibile caricare la foto',
    selectPhoto: 'Seleziona una foto',
    photoSupportedFormats: 'Formati supportati: JPG, PNG, GIF, WEBP (Max 5MB)',
    cropPhoto: 'Ritaglia Foto',
    cropPhotoDescription: 'Regola l\'immagine alla dimensione e posizione desiderate',
    saveCrop: 'Salva e Carica',
    fileSizeError: 'La dimensione del file deve essere inferiore a 5MB',
    fileReadError: 'Errore nella lettura del file. Riprova.',
    adjustCropError: 'Regola l\'area di ritaglio prima di salvare.',
    cropSizeError: 'La dimensione del file deve essere inferiore a 5MB. Prova a ritagliare un\'area più piccola.',
    cancel: 'Annulla',
  },
};

// Helper function to create image from URL
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

// Get cropped image blob
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
};

const PhotoUpload = ({ 
  currentPhoto, 
  onPhotoUpdate, 
  language = 'en',
  className = '',
  size = 'md' // 'sm', 'md', 'lg'
}) => {
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToast();
  const t = translations[language] || translations.en;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: (file) => authService.uploadPhoto(file),
    onSuccess: async (response) => {
      setUploadingPhoto(false);
      
      const photo = response?.data?.photo || response?.data?.user?.photo || response?.photo;
      if (photo) {
        const photoUrl = photo.startsWith('/uploads/') 
          ? `${API_BASE_URL}${photo}` 
          : photo;
        setPhotoPreview(photoUrl);
        if (onPhotoUpdate) {
          onPhotoUpdate(photoUrl);
        }
      }
      
      setImageToCrop(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
      
      await queryClient.invalidateQueries(['userProfile']);
      await queryClient.invalidateQueries(['currentUser']);
      await queryClient.refetchQueries(['userProfile']);
      await queryClient.refetchQueries(['currentUser']);
      
      setTimeout(() => {
        setPhotoPreview(null);
      }, 1000);
      
      showSuccess(t.photoUploaded);
    },
    onError: (error) => {
      setUploadingPhoto(false);
      setPhotoPreview(null);
      const errorMessage = error?.message 
        || error?.response?.data?.message
        || error?.response?.message
        || error?.error?.message
        || t.photoUploadFailed;
      
      showError(translateError(errorMessage, language));
    },
  });

  // Handle crop completion
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Handle photo file selection
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showError(t.photoSupportedFormats);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showError(t.fileSizeError);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result);
      setShowCropModal(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    };
    reader.onerror = () => {
      showError(t.fileReadError);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle crop and upload
  const handleCropAndUpload = async () => {
    if (!imageToCrop || !croppedAreaPixels) {
      showError(t.adjustCropError);
      return;
    }

    try {
      setUploadingPhoto(true);
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      if (!croppedBlob || croppedBlob.size === 0) {
        throw new Error('Failed to create image blob');
      }

      if (croppedBlob.size > 5 * 1024 * 1024) {
        showError(t.cropSizeError);
        setUploadingPhoto(false);
        return;
      }
      
      const croppedFile = new File([croppedBlob], 'profile-photo.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      uploadPhotoMutation.mutate(croppedFile);
      
      setShowCropModal(false);
      setImageToCrop(null);
      setPhotoPreview(imageToCrop);
    } catch (error) {
      showError(error.message || t.photoUploadFailed);
      setUploadingPhoto(false);
    }
  };

  // Get photo URL helper
  const getPhotoUrl = useCallback((photo) => {
    if (!photo) return null;
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
    if (photo.startsWith('/uploads/')) {
      return `${API_BASE_URL}${photo}`;
    }
    return `${API_BASE_URL}/uploads/${photo}`;
  }, []);

  const displayPhoto = photoPreview || getPhotoUrl(currentPhoto);

  return (
    <>
      <div className={`relative inline-block ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center`}>
          {displayPhoto ? (
            <img
              src={displayPhoto}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={() => setPhotoPreview(null)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-100">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
            </div>
          )}
        </div>
        <label
          htmlFor="photo-upload"
          className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-1.5 sm:p-2 cursor-pointer hover:bg-primary-700 transition-colors shadow-lg"
          title={t.uploadPhoto}
        >
          <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
          <input
            id="photo-upload"
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
            disabled={uploadingPhoto}
          />
        </label>
        {uploadingPhoto && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Crop Modal */}
      <Modal
        isOpen={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setImageToCrop(null);
          if (photoInputRef.current) {
            photoInputRef.current.value = '';
          }
        }}
        title={t.cropPhoto}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{t.cropPhotoDescription}</p>
          <div className="relative w-full h-64 sm:h-96 bg-gray-100 rounded-lg overflow-hidden">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowCropModal(false);
                setImageToCrop(null);
                if (photoInputRef.current) {
                  photoInputRef.current.value = '';
                }
              }}
              disabled={uploadingPhoto}
            >
              {t.cancel || 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={handleCropAndUpload}
              loading={uploadingPhoto}
              disabled={uploadingPhoto}
            >
              {t.saveCrop}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PhotoUpload;

