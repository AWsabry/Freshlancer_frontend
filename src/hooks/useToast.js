import { useState, useCallback } from 'react';

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    const id = ++toastIdCounter;
    const toast = {
      id,
      message,
      type,
      title: options.title,
      duration: options.duration || 5000,
      autoClose: options.autoClose !== false,
    };

    setToasts((prev) => [...prev, toast]);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, options = {}) => {
    return showToast(message, 'success', options);
  }, [showToast]);

  const error = useCallback((message, options = {}) => {
    return showToast(message, 'error', options);
  }, [showToast]);

  const warning = useCallback((message, options = {}) => {
    return showToast(message, 'warning', options);
  }, [showToast]);

  const info = useCallback((message, options = {}) => {
    return showToast(message, 'info', options);
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

