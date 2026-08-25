import express from 'express';
import mongoose from 'mongoose';
import authMiddleware from '../middleware/authMiddleware.js';
import Chat from '../model/Chat.js';
import { emitNewMessage } from '../socket/chatSocket.js';
import {
  addMessage,
  isParticipant,
  populateChat,
  serializeChat,
  startChat,
} from '../utils/chatService.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.userId })
      .select('-messages')
      .populate('participants', 'name')
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      status: true,
      chats: chats.map((chat) => serializeChat(chat)),
    });
  } catch (error) {
    console.log('List chats error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load chats' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { itemId, itemKind } = req.body;
    const chat = await startChat({
      itemId,
      itemKind,
      userId: req.user.userId,
    });

    return res.status(200).json({
      status: true,
      chat: serializeChat(chat),
    });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.log('Start chat error:', error);
    return res.status(status).json({
      status: false,
      message: error.message || 'Failed to start chat',
    });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: false, message: 'Invalid chat ID' });
    }

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ status: false, message: 'Chat not found' });
    }

    if (!isParticipant(chat, req.user.userId)) {
      return res.status(403).json({ status: false, message: 'You are not part of this chat' });
    }

    await populateChat(chat, { includeMessages: true });

    return res.status(200).json({
      status: true,
      chat: serializeChat(chat, { includeMessages: true }),
    });
  } catch (error) {
    console.log('Get chat error:', error);
    return res.status(500).json({ status: false, message: 'Failed to load chat' });
  }
});

router.post('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { chat, message } = await addMessage({
      chatId: req.params.id,
      userId: req.user.userId,
      text: req.body.text,
    });

    const payload = emitNewMessage(req.app.get('io'), chat, message);

    return res.status(201).json({
      status: true,
      ...payload,
    });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.log('Send message error:', error);
    return res.status(status).json({
      status: false,
      message: error.message || 'Failed to send message',
    });
  }
});

export default router;
