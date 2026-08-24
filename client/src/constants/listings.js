export const LISTINGS = {
  found: {
    kind: 'found',
    listPath: '/items',
    postPath: '/post-item',
    dateField: 'foundDate',
  },
  lost: {
    kind: 'lost',
    listPath: '/lost-items',
    postPath: '/post-lost',
    dateField: 'lostDate',
  },
};

export function getListing(kind = 'found') {
  return LISTINGS[kind] || LISTINGS.found;
}

export function getItemDate(item) {
  return item?.lostDate || item?.foundDate || item?.createdAt;
}
