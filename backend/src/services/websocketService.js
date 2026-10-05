import { Server } from 'socket.io';

let io = null;

export const initWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  } else {
    console.warn('[WebSocket] Cannot broadcast. io instance is not initialized.');
  }
};
