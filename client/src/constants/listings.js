export const LISTINGS = {
  found: {
    kind: 'found',
    listPath: '/items',
    postPath: '/post-item',
    dateField: 'foundDate',
    pageTitle: 'Raadi Alaab La Helay — Baafiye',
    postTitle: 'Soo gudbi shay la helay — Baafiye',
  },
  lost: {
    kind: 'lost',
    listPath: '/lost-items',
    postPath: '/post-lost',
    dateField: 'lostDate',
    pageTitle: 'Raadi Alaab Lumay — Baafiye',
    postTitle: 'Soo gudbi shay lumay — Baafiye',
  },
};

export function getListing(kind = 'found') {
  return LISTINGS[kind] || LISTINGS.found;
}

export function getItemDate(item) {
  return item?.lostDate || item?.foundDate || item?.createdAt;
}
