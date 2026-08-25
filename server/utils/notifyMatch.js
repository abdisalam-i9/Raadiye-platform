import Notification from '../model/Notification.js';
import User from '../model/UserModel.js';
import { sendMatchEmail } from '../job/email.js';
import env from '../config/env.js';
import { findMatches } from './matchService.js';

function itemHref(kind, id) {
  const path = kind === 'lost' ? `/lost-items/${id}` : `/items/${id}`;
  return `${env.CLIENT_URL}${path}`;
}

export function serializeNotification(doc) {
  const id = String(doc._id);
  return {
    id,
    type: doc.type,
    sourceKind: doc.sourceKind,
    sourceItemId: String(doc.sourceItem),
    sourceTitle: doc.sourceTitle,
    matchedKind: doc.matchedKind,
    matchedItemId: String(doc.matchedItem),
    matchedTitle: doc.matchedTitle,
    score: doc.score,
    read: doc.read,
    createdAt: doc.createdAt,
    href: doc.matchedKind === 'lost' ? `/lost-items/${doc.matchedItem}` : `/items/${doc.matchedItem}`,
  };
}

async function createMatchNotification({ userId, sourceKind, sourceItem, matchedKind, matchedItem, score, io }) {
  try {
    const notification = await Notification.create({
      user: userId,
      type: 'match',
      sourceKind,
      sourceItem: sourceItem._id,
      sourceTitle: sourceItem.title,
      matchedKind,
      matchedItem: matchedItem._id,
      matchedTitle: matchedItem.title,
      score,
    });

    const payload = serializeNotification(notification);
    io?.to(`user:${userId}`).emit('new-notification', { notification: payload });

    const user = await User.findById(userId).select('email name');
    if (user?.email) {
      sendMatchEmail({
        to: user.email,
        name: user.name,
        sourceTitle: sourceItem.title,
        matchedTitle: matchedItem.title,
        link: itemHref(matchedKind, matchedItem._id),
      }).catch((error) => console.log('Match email error:', error));
    }

    return payload;
  } catch (error) {
    if (error.code === 11000) return null;
    throw error;
  }
}

export async function notifyMatchesForItem({ item, kind, io }) {
  if (!item || item.status !== 'active') return [];

  const matches = await findMatches(item, kind, { limit: 3 });
  const posterId = String(item.postedBy?._id || item.postedBy);
  const created = [];

  for (const match of matches) {
    const otherId = String(match.item.postedBy?._id || match.item.postedBy);
    if (!otherId || otherId === posterId) continue;

    const forOwner = await createMatchNotification({
      userId: otherId,
      sourceKind: match.kind,
      sourceItem: match.item,
      matchedKind: kind,
      matchedItem: item,
      score: match.score,
      io,
    });
    if (forOwner) created.push(forOwner);

    const forPoster = await createMatchNotification({
      userId: posterId,
      sourceKind: kind,
      sourceItem: item,
      matchedKind: match.kind,
      matchedItem: match.item,
      score: match.score,
      io,
    });
    if (forPoster) created.push(forPoster);
  }

  return created;
}
