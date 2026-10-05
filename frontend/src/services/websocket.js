import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Connect to Node.js backend (Socket.io)
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling'],
});

socket.on('connect',    () => console.log('[WS] Connected to AgentOps backend'));
socket.on('disconnect', () => console.log('[WS] Disconnected from backend'));
socket.on('connect_error', (e) => console.log('[WS] Connection error:', e.message));

// Re-usable hook — stable callback ref to avoid re-subscribing on every render
export function useSocket(event, callback) {
  const cbRef = useRef(callback);
  useEffect(() => { cbRef.current = callback; }, [callback]);

  useEffect(() => {
    const handler = (...args) => cbRef.current(...args);
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [event]);
}

export default socket;
