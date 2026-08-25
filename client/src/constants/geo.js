export const MOGADISHU_CENTER = { lat: 2.0469, lng: 45.3182 };

export const DISTRICT_COORDINATES = {
  Abdiaziz: { lat: 2.038, lng: 45.344 },
  Bondhere: { lat: 2.037, lng: 45.338 },
  Daynile: { lat: 2.078, lng: 45.299 },
  Dharkenley: { lat: 2.013, lng: 45.269 },
  'Hamar Jajab': { lat: 2.029, lng: 45.338 },
  'Hamar Weyne': { lat: 2.034, lng: 45.341 },
  Hodan: { lat: 2.047, lng: 45.307 },
  Howlwadaag: { lat: 2.04, lng: 45.325 },
  Kahda: { lat: 2.02, lng: 45.25 },
  Karaan: { lat: 2.055, lng: 45.36 },
  Shangani: { lat: 2.035, lng: 45.345 },
  Shibis: { lat: 2.048, lng: 45.351 },
  Waberi: { lat: 2.037, lng: 45.318 },
  Wadajir: { lat: 2.022, lng: 45.3 },
  'Warta Nabada': { lat: 2.055, lng: 45.325 },
  Yaqshid: { lat: 2.07, lng: 45.348 },
  Garasbaaley: { lat: 2.065, lng: 45.27 },
  Daarusalaam: { lat: 2.09, lng: 45.28 },
  Gubadley: { lat: 2.11, lng: 45.31 },
  Huriwaa: { lat: 2.085, lng: 45.365 },
};

export function coordsForDistrict(district) {
  return DISTRICT_COORDINATES[district] || MOGADISHU_CENTER;
}

export function googleMapsUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function googleMapsEmbedUrl(lat, lng) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
}

export function itemCoords(item) {
  const lat = Number(item?.lat);
  const lng = Number(item?.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return coordsForDistrict(item?.district);
}

export function isOpenStatus(status) {
  return status === 'active' || status === 'matched';
}

export function trackingStage(status) {
  if (status === 'matched') return 'matched';
  if (status === 'active') return 'pending';
  return 'closed';
}
