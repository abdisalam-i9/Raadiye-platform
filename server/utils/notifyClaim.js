import Notification from '../model/Notification.js';
import { emitNotification } from './notifications.js';

function itemHref(kind, id) {
  return kind === 'lost' ? `/lost-items/${id}` : `/items/${id}`;
}

export async function notifyClaim({ ownerId, claimantName, item, kind, io }) {
  const notification = await Notification.create({
    user: ownerId,
    type: 'claim',
    sourceKind: kind,
    sourceItem: item._id,
    sourceTitle: item.title,
    senderName: claimantName || '',
    preview: 'A person described private marks for this item.',
    itemTitle: item.title,
  });
  emitNotification(io, ownerId, notification, { created: true });
  return notification;
}

export async function notifyClaimResult({ claimantId, item, kind, accepted, io }) {
  const notification = await Notification.create({
    user: claimantId,
    type: 'claim',
    sourceKind: kind,
    sourceItem: item._id,
    sourceTitle: item.title,
    preview: accepted
      ? 'Your ownership claim was accepted. You can now see the contact number.'
      : 'Your ownership claim was not accepted.',
    itemTitle: item.title,
  });
  emitNotification(io, claimantId, notification, { created: true });
  return notification;
}

export { itemHref };
