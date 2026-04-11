// Global toast utility that can be used anywhere
// This creates a singleton instance that works with the ToastContext

let toastInstance = null;

export const setToastInstance = (instance) => {
  toastInstance = instance;
};

export const toast = {
  success: (message, options = {}) => {
    if (toastInstance) {
      return toastInstance.success(message, options);
    } else {
      // Fallback to browser alert if toast not initialized
      console.warn('Toast not initialized, falling back to alert');
      alert(message);
    }
  },
  error: (message, options = {}) => {
    if (toastInstance) {
      return toastInstance.error(message, options);
    } else {
      console.warn('Toast not initialized, falling back to alert');
      alert(message);
    }
  },
  warning: (message, options = {}) => {
    if (toastInstance) {
      return toastInstance.warning(message, options);
    } else {
      console.warn('Toast not initialized, falling back to alert');
      alert(message);
    }
  },
  info: (message, options = {}) => {
    if (toastInstance) {
      return toastInstance.info(message, options);
    } else {
      console.warn('Toast not initialized, falling back to alert');
      alert(message);
    }
  },
};

// Replace global alert and confirm functions
const originalAlert = window.alert;
const originalConfirm = window.confirm;

// Store confirm callbacks
let confirmCallback = null;
let confirmModalOpen = false;

export const setConfirmCallback = (callback) => {
  confirmCallback = callback;
};

window.alert = (message) => {
  if (toastInstance) {
    toastInstance.info(message);
  } else {
    originalAlert(message);
  }
};

window.confirm = (message) => {
  if (confirmCallback) {
    return new Promise((resolve) => {
      confirmCallback(message, resolve);
    });
  } else {
    return originalConfirm(message);
  }
};

