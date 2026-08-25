const STOPWORDS = new Set([
  'a', 'an', 'and', 'at', 'in', 'of', 'on', 'or', 'the', 'to', 'with',
  'ah', 'ee', 'iyo', 'ka', 'ku', 'la', 'oo', 'waa', 'waxaa', 'shay',
]);

export function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(value) {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function bigrams(value) {
  const text = ` ${normalizeText(value)} `;
  const grams = [];
  for (let i = 0; i < text.length - 1; i += 1) {
    grams.push(text.slice(i, i + 2));
  }
  return grams;
}

export function diceCoefficient(left, right) {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (!a || !b) return 0;
  if (a === b) return 1;

  const leftGrams = bigrams(a);
  const rightGrams = bigrams(b);
  if (!leftGrams.length || !rightGrams.length) return 0;

  const rightCounts = new Map();
  rightGrams.forEach((gram) => {
    rightCounts.set(gram, (rightCounts.get(gram) || 0) + 1);
  });

  let overlap = 0;
  leftGrams.forEach((gram) => {
    const count = rightCounts.get(gram) || 0;
    if (count > 0) {
      overlap += 1;
      rightCounts.set(gram, count - 1);
    }
  });

  return (2 * overlap) / (leftGrams.length + rightGrams.length);
}

export function jaccardTokens(left, right) {
  const a = new Set(tokenize(left));
  const b = new Set(tokenize(right));
  if (!a.size || !b.size) return 0;

  let overlap = 0;
  a.forEach((token) => {
    if (b.has(token)) overlap += 1;
  });

  return overlap / (a.size + b.size - overlap);
}

function levenshtein(left, right) {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const rows = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = i - 1;
    rows[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = rows[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[j] = Math.min(rows[j] + 1, rows[j - 1] + 1, prev + cost);
      prev = current;
    }
  }
  return rows[b.length];
}

export function titleSimilarity(left, right) {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (!a || !b) return 0;
  if (a === b) return 1;

  let score = jaccardTokens(a, b) * 0.6 + diceCoefficient(a, b) * 0.4;

  if (a.includes(b) || b.includes(a)) {
    score = Math.max(score, 0.72);
  }

  const maxLen = Math.max(a.length, b.length);
  if (maxLen > 0 && maxLen <= 18) {
    const editScore = 1 - levenshtein(a, b) / maxLen;
    score = Math.max(score, editScore);
  }

  return Math.max(0, Math.min(1, score));
}
