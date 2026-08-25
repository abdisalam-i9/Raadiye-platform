import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { handleItemImageUpload } from '../middleware/uploadMiddleware.js';
import Category from '../model/Category.js';
import env from '../config/env.js';

const router = express.Router();

function scoreName(query, name) {
  const q = String(query || '').toLowerCase();
  const n = String(name || '').toLowerCase();
  if (!q || !n) return 0;
  if (n === q) return 1;
  if (n.includes(q) || q.includes(n)) return 0.8;
  const qTokens = new Set(q.split(/\s+/).filter(Boolean));
  const nTokens = new Set(n.split(/\s+/).filter(Boolean));
  let overlap = 0;
  qTokens.forEach((token) => {
    if (nTokens.has(token)) overlap += 1;
  });
  if (!qTokens.size) return 0;
  return overlap / qTokens.size;
}

async function suggestFromOpenAI(file, categories) {
  const key = env.OPENAI_API_KEY;
  if (!key || !file?.buffer) return null;

  const mime = file.mimetype || 'image/jpeg';
  const dataUrl = `data:${mime};base64,${file.buffer.toString('base64')}`;
  const names = categories.map((category) => category.name).join(', ');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `This is a lost-and-found photo in Mogadishu. Reply as JSON only: {"title":"short item name","category":"one of: ${names}"}.`,
            },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const json = JSON.parse(text.replace(/```json|```/g, '').trim());
  const match = categories.find(
    (category) => category.name.toLowerCase() === String(json.category || '').toLowerCase()
  );
  return {
    title: String(json.title || '').slice(0, 80),
    categoryId: match?._id,
    categoryName: match?.name || '',
    source: 'ai',
  };
}

router.post('/suggest', authMiddleware, handleItemImageUpload, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const categories = await Category.find({ isActive: true }).select('name');

    let suggestion = null;
    try {
      suggestion = await suggestFromOpenAI(req.file, categories);
    } catch (error) {
      console.log('Vision AI error:', error.message || error);
    }

    if (!suggestion) {
      const ranked = categories
        .map((category) => ({
          category,
          score: Math.max(scoreName(title, category.name), scoreName(req.file?.originalname, category.name)),
        }))
        .sort((a, b) => b.score - a.score);
      const best = ranked[0];
      suggestion = {
        title,
        categoryId: best?.score > 0.3 ? best.category._id : '',
        categoryName: best?.score > 0.3 ? best.category.name : '',
        source: env.OPENAI_API_KEY ? 'fallback' : 'none',
      };
    }

    return res.status(200).json({
      status: true,
      available: Boolean(env.OPENAI_API_KEY),
      suggestion,
    });
  } catch (error) {
    console.log('Vision suggest error:', error);
    return res.status(500).json({ status: false, message: 'Failed to suggest item details' });
  }
});

export default router;
