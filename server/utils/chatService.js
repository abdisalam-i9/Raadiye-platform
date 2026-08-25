import mongoose from 'mongoose';
import Chat from '../model/Chat.js';
import FoundItem from '../model/FoundItem.js';
import LostItem from '../model/LostItem.js';

export function makePairKey(userA, userB) {
  return [String(userA), String(userB)].sort().join(':');
}

export function isParticipant(chat, userId) {
  return chat.participants.some((participant) => String(participant._id || participant) === String(userId));
}

export async function findListing(itemId, itemKind) {
  if (!mongoose.Types.ObjectId.isValid(itemId)) return null;
  if (itemKind !== 'found' && itemKind !== 'lost') return null;
  const Model = itemKind === 'lost' ? LostItem : FoundItem;
  return Model.findById(itemId);
}

export function serializeUser(user) {
  if (!user) return null;
  return {
    id: String(user._id || user.id),
    name: user.name || '',
  };
}

export function serializeMessage(message) {
  const sender = message.sender;
  return {
    id: String(message._id),
    text: message.text,
    senderId: String(sender?._id || sender),
    senderName: sender?.name || '',
    createdAt: message.createdAt,
  };
}

export function serializeChat(chat, { includeMessages = false } = {}) {
  const last = chat.messages?.[chat.messages.length - 1];
  return {
    id: String(chat._id),
    itemId: String(chat.item),
    itemKind: chat.itemKind,
    itemTitle: chat.itemTitle,
    participants: (chat.participants || []).map(serializeUser),
    lastMessage: chat.lastMessageText || last?.text || '',
    lastMessageAt: chat.lastMessageAt || last?.createdAt || chat.updatedAt,
    messages: includeMessages ? (chat.messages || []).map(serializeMessage) : undefined,
  };
}

export async function populateChat(chat, { includeMessages = false } = {}) {
  await chat.populate('participants', 'name');
  if (includeMessages) {
    await chat.populate('messages.sender', 'name');
  }
  return chat;
}

export async function startChat({ itemId, itemKind, userId }) {
  const item = await findListing(itemId, itemKind);
  if (!item) {
    const error = new Error('Item not found');
    error.status = 404;
    throw error;
  }

  if (item.status !== 'active') {
    const error = new Error('This item is no longer available for chat');
    error.status = 400;
    throw error;
  }

  const ownerId = String(item.postedBy);
  const requesterId = String(userId);

  if (ownerId === requesterId) {
    const error = new Error('You cannot start a chat on your own item');
    error.status = 400;
    throw error;
  }

  const pairKey = makePairKey(ownerId, requesterId);
  let chat = await Chat.findOne({ item: item._id, itemKind, pairKey });

  if (!chat) {
    try {
      chat = await Chat.create({
        item: item._id,
        itemKind,
        itemTitle: item.title,
        participants: [item.postedBy, userId],
        pairKey,
        messages: [],
      });
    } catch (error) {
      if (error.code === 11000) {
        chat = await Chat.findOne({ item: item._id, itemKind, pairKey });
      } else {
        throw error;
      }
    }
  }

  await populateChat(chat);
  return chat;
}

export async function addMessage({ chatId, userId, text }) {
  const cleanText = String(text || '').trim();
  if (!cleanText) {
    const error = new Error('Message cannot be empty');
    error.status = 400;
    throw error;
  }
  if (cleanText.length > 2000) {
    const error = new Error('Message is too long');
    error.status = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    const error = new Error('Invalid chat ID');
    error.status = 400;
    throw error;
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    const error = new Error('Chat not found');
    error.status = 404;
    throw error;
  }

  if (!isParticipant(chat, userId)) {
    const error = new Error('You are not part of this chat');
    error.status = 403;
    throw error;
  }

  chat.messages.push({ sender: userId, text: cleanText });
  chat.lastMessageText = cleanText;
  chat.lastMessageAt = new Date();
  await chat.save();

  const saved = chat.messages[chat.messages.length - 1];
  await chat.populate('messages.sender', 'name');
  const populated = chat.messages.id(saved._id);
  return { chat, message: populated || saved };
}
