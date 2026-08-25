import Notification from '../model/Notification.js';
import User from '../model/UserModel.js';
import { sendMessageEmail } from '../job/email.js';
import env from '../config/env.js';
import { emitNotification, isUserInRoom } from './notifications.js';

function previewText(value) {
  const text = String(value || '').trim();
  if (text.length <= 140) return text;
  return `${text.slice(0, 137)}...`;
}

export async function notifyNewMessage({ chat, message, io }) {
  if (!chat || !message) return;

  const senderId = String(message.sender?._id || message.sender || '');
  const senderName = message.sender?.name || '';
  const preview = previewText(message.text);
  const itemTitle = chat.itemTitle || '';
  const recipients = (chat.participants || [])
    .map((participant) => String(participant._id || participant))
    .filter((id) => id && id !== senderId);

  for (const userId of recipients) {
    try {
      if (await isUserInRoom(io, userId, `chat:${chat._id}`)) continue;

      const existing = await Notification.findOne({
        user: userId,
        type: 'message',
        chat: chat._id,
        read: false,
      });

      let notification = existing;
      let created = false;

      if (existing) {
        existing.senderName = senderName;
        existing.preview = preview;
        existing.itemTitle = itemTitle;
        await existing.save();
      } else {
        notification = await Notification.create({
          user: userId,
          type: 'message',
          chat: chat._id,
          senderName,
          preview,
          itemTitle,
          read: false,
        });
        created = true;
      }

      emitNotification(io, userId, notification, { created });

      if (!created) continue;

      const user = await User.findById(userId).select('email name');
      if (!user?.email) continue;

      sendMessageEmail({
        to: user.email,
        name: user.name,
        senderName,
        preview,
        itemTitle,
        link: `${env.CLIENT_URL}/chats/${chat._id}`,
      }).catch((error) => console.log('Message email error:', error));
    } catch (error) {
      console.log('Message notify error:', error);
    }
  }
}
