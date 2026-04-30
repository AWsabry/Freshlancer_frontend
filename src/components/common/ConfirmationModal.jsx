import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Action'} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${
              variant === 'danger' ? 'text-red-600' : 'text-blue-600'
            }`} />
          </div>
          <div className="flex-1">
            <p className="text-gray-700">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

