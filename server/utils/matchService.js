import FoundItem from '../model/FoundItem.js';
import LostItem from '../model/LostItem.js';
import { diceCoefficient, titleSimilarity } from './textSimilarity.js';

const MIN_TITLE = 0.25;
const MIN_SCORE = 0.4;
const MAX_RESULTS = 6;
const CANDIDATE_LIMIT = 400;

function categoryId(value) {
  return String(value?._id || value || '');
}

function haversineKm(left, right) {
  if (
    left.lat == null ||
    left.lng == null ||
    right.lat == null ||
    right.lng == null
  ) {
    return null;
  }
  const toRad = (value) => (Number(value) * Math.PI) / 180;
  const dLat = toRad(right.lat - left.lat);
  const dLng = toRad(right.lng - left.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(left.lat)) * Math.cos(toRad(right.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function locationScore(left, right) {
  const km = haversineKm(left, right);
  if (km != null) {
    if (km <= 1) return 1;
    if (km <= 3) return 0.82;
    if (km <= 8) return 0.55;
  }

  const sameDistrict = Boolean(left.district && right.district && left.district === right.district);
  const village = diceCoefficient(left.village, right.village);

  if (sameDistrict) return 0.7 + village * 0.3;
  return village * 0.35;
}

export function scorePair(source, candidate) {
  const title = titleSimilarity(source.title, candidate.title);
  const sameCategory = categoryId(source.category) === categoryId(candidate.category);
  const location = locationScore(source, candidate);
  const score = title * 0.55 + (sameCategory ? 0.25 : 0) + location * 0.2;

  return {
    score,
    title,
    sameCategory,
    sameDistrict: Boolean(source.district && source.district === candidate.district),
    village: diceCoefficient(source.village, candidate.village),
  };
}

function serializeItem(item) {
  const doc = item.toObject ? item.toObject() : item;
  return {
    _id: doc._id,
    title: doc.title,
    category: doc.category,
    district: doc.district,
    village: doc.village,
    lat: doc.lat,
    lng: doc.lng,
    image: doc.image || '',
    status: doc.status,
    foundDate: doc.foundDate,
    lostDate: doc.lostDate,
    createdAt: doc.createdAt,
    postedBy: doc.postedBy,
  };
}

export async function findMatches(item, kind, { limit = MAX_RESULTS } = {}) {
  if (!item) return [];

  const oppositeKind = kind === 'lost' ? 'found' : 'lost';
  const Opposite = oppositeKind === 'lost' ? LostItem : FoundItem;
  const posterId = String(item.postedBy?._id || item.postedBy || '');

  const candidates = await Opposite.find({ status: 'active' })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(CANDIDATE_LIMIT);

  return candidates
    .filter((candidate) => String(candidate.postedBy) !== posterId)
    .map((candidate) => {
      const details = scorePair(item, candidate);
      return { candidate, details };
    })
    .filter(({ details }) => details.title >= MIN_TITLE && details.score >= MIN_SCORE)
    .sort((a, b) => b.details.score - a.details.score)
    .slice(0, limit)
    .map(({ candidate, details }) => ({
      kind: oppositeKind,
      score: Math.round(details.score * 100) / 100,
      reasons: {
        title: Math.round(details.title * 100) / 100,
        category: details.sameCategory,
        district: details.sameDistrict,
        village: Math.round(details.village * 100) / 100,
      },
      item: serializeItem(candidate),
    }));
}
