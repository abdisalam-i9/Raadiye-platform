export function posterId(item) {
  return String(item?.postedBy?._id || item?.postedBy || '');
}

export function sanitizeListing(item, { user, publicList = false, canSeePhone = false } = {}) {
  const doc = typeof item.toObject === 'function' ? item.toObject() : { ...item };
  const ownerId = posterId(doc);
  const isOwner = Boolean(user?.userId && String(user.userId) === ownerId);
  const isAdmin = user?.role === 'admin';
  const privateOk = isOwner || isAdmin;

  doc.hasMarks = Boolean(String(doc.identifyingMarks || '').trim());

  if (publicList || !privateOk) {
    delete doc.identifyingMarks;
  }
  if (!(privateOk || canSeePhone)) {
    delete doc.contactPhone;
  }

  return doc;
}
