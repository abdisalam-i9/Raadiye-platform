export function notificationCopy(item, t) {
  if (item.type === 'message') {
    return {
      kind: t.notify.message,
      title: item.title || t.notify.newMessage,
      body: item.body || item.sourceTitle || '',
    };
  }

  if (item.type === 'claim') {
    return {
      kind: t.notify.claim,
      title: item.title || t.notify.claim,
      body: item.body || '',
    };
  }

  return {
    kind: t.notify.match,
    title: item.title || item.matchedTitle || t.notify.match,
    body: `${t.notify.forItem}: ${item.body || item.sourceTitle || ''}`,
  };
}
