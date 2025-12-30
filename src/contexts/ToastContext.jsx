import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ToastContainer from '../components/common/ToastContainer';
import { setToastInstance } from '../utils/toast';

const ToastContext = createContext();

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
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

  const value = {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  useEffect(() => {
    // Set global toast instance
    setToastInstance(value);
  }, [value]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

