import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  return process.env.NODE_ENV === 'production'
    ? 'https://backend.freshlancer.online'
    : 'http://localhost:8080';
};

export const connectWebSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No token found, cannot connect WebSocket');
    return null;
  }

  const apiUrl = getApiBaseUrl();
  socket = io(apiUrl, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
    reconnectAttempts = 0;
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error.message);
    reconnectAttempts++;
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
    }
  });

  socket.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });

  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinAppealRoom = (appealId) => {
  const s = connectWebSocket();
  if (s) {
    s.emit('join-appeal', appealId);
  }
};

export const leaveAppealRoom = (appealId) => {
  if (socket) {
    socket.emit('leave-appeal', appealId);
  }
};

export const sendAppealMessage = (appealId, content, attachments = []) => {
  if (socket) {
    socket.emit('send-message', {
      appealId,
      content,
      attachments,
    });
  }
};

export const onAppealMessage = (callback) => {
  if (socket) {
    socket.on('new-message', callback);
    return () => socket.off('new-message', callback);
  }
  return () => {};
};

export const onUserTyping = (callback) => {
  if (socket) {
    socket.on('user-typing', callback);
    return () => socket.off('user-typing', callback);
  }
  return () => {};
};

export const sendTypingIndicator = (appealId, isTyping) => {
  if (socket) {
    socket.emit('typing', { appealId, isTyping });
  }
};

export const markMessageRead = (appealId, messageId) => {
  if (socket) {
    socket.emit('read-message', { appealId, messageId });
  }
};

export const onUserJoined = (callback) => {
  if (socket) {
    socket.on('user-joined', callback);
    return () => socket.off('user-joined', callback);
  }
  return () => {};
};

export const onError = (callback) => {
  if (socket) {
    socket.on('error', callback);
    return () => socket.off('error', callback);
  }
  return () => {};
};

// Auto-connect when token is available
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    connectWebSocket();
  }
}
