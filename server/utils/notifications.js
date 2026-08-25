export function serializeNotification(doc) {
  const type = doc.type || 'match';
  const id = String(doc._id);
  const createdAt = doc.updatedAt || doc.createdAt;

  if (type === 'message') {
    return {
      id,
      type: 'message',
      title: doc.senderName || '',
      body: doc.preview || '',
      sourceTitle: doc.itemTitle || '',
      chatId: doc.chat ? String(doc.chat) : '',
      href: doc.chat ? `/chats/${doc.chat}` : '/chats',
      read: Boolean(doc.read),
      createdAt,
    };
  }

  if (type === 'claim') {
    return {
      id,
      type: 'claim',
      title: doc.sourceTitle || '',
      body: doc.preview || '',
      sourceKind: doc.sourceKind,
      sourceItemId: doc.sourceItem ? String(doc.sourceItem) : '',
      href: doc.sourceKind === 'lost' ? `/lost-items/${doc.sourceItem}` : `/items/${doc.sourceItem}`,
      read: Boolean(doc.read),
      createdAt,
    };
  }

  return {
    id,
    type: 'match',
    title: doc.matchedTitle || '',
    body: doc.sourceTitle || '',
    sourceKind: doc.sourceKind,
    sourceItemId: doc.sourceItem ? String(doc.sourceItem) : '',
    sourceTitle: doc.sourceTitle || '',
    matchedKind: doc.matchedKind,
    matchedItemId: doc.matchedItem ? String(doc.matchedItem) : '',
    matchedTitle: doc.matchedTitle || '',
    score: doc.score || 0,
    href: doc.matchedKind === 'lost' ? `/lost-items/${doc.matchedItem}` : `/items/${doc.matchedItem}`,
    read: Boolean(doc.read),
    createdAt,
  };
}

export function emitNotification(io, userId, notification, { created = true } = {}) {
  io?.to(`user:${userId}`).emit('new-notification', {
    notification: serializeNotification(notification),
    created,
  });
}

export async function isUserInRoom(io, userId, room) {
  if (!io) return false;
  const sockets = await io.in(`user:${String(userId)}`).fetchSockets();
  return sockets.some((socket) => socket.rooms.has(room));
}
