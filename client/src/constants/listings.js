export const LISTINGS = {
  found: {
    kind: 'found',
    listPath: '/items',
    postPath: '/items?add=1&kind=found',
    dateField: 'foundDate',
  },
  lost: {
    kind: 'lost',
    listPath: '/lost-items',
    postPath: '/items?add=1&kind=lost',
    dateField: 'lostDate',
  },
};

export function getListing(kind = 'found') {
  return LISTINGS[kind] || LISTINGS.found;
}

export function itemPath(kind, id) {
  return kind === 'lost' ? `/lost-items/${id}` : `/items/${id}`;
}

export function browsePath(kind) {
  if (kind === 'lost') return '/items?kind=lost';
  if (kind === 'found') return '/items?kind=found';
  return '/items';
}

export function getItemDate(item) {
  return item?.lostDate || item?.foundDate || item?.createdAt;
}
