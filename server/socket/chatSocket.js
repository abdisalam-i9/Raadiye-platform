import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import Chat from '../model/Chat.js';
import { addMessage, isParticipant, serializeMessage } from '../utils/chatService.js';

export function emitNewMessage(io, chat, message) {
  const payload = {
    chatId: String(chat._id),
    message: serializeMessage(message),
  };
  if (!io) return payload;
  io.to(`chat:${chat._id}`).emit('new-message', payload);
  (chat.participants || []).forEach((participant) => {
    io.to(`user:${String(participant._id || participant)}`).emit('new-message', payload);
  });
  return payload;
}

export function attachChatSocket(httpServer, app) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  app.set('io', io);

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, env.JWT.SECRET);
      if (!decoded?.userId) {
        return next(new Error('Invalid or expired token'));
      }
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('join-chat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat || !isParticipant(chat, socket.userId)) {
          socket.emit('chat-error', { message: 'You are not part of this chat' });
          return;
        }
        socket.join(`chat:${chatId}`);
      } catch (error) {
        console.log('Join chat error:', error);
        socket.emit('chat-error', { message: 'Failed to join chat' });
      }
    });

    socket.on('leave-chat', (chatId) => {
      if (chatId) socket.leave(`chat:${chatId}`);
    });

    socket.on('send-message', async ({ chatId, text } = {}) => {
      try {
        const { chat, message } = await addMessage({
          chatId,
          userId: socket.userId,
          text,
        });
        emitNewMessage(io, chat, message);
      } catch (error) {
        socket.emit('chat-error', {
          message: error.message || 'Failed to send message',
        });
      }
    });
  });

  return io;
}
