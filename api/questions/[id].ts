import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const QUESTIONS_KEY = 'questions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const raw: string[] = await redis.lrange(QUESTIONS_KEY, 0, -1);
    for (const item of raw) {
      const parsed = typeof item === 'string' ? JSON.parse(item) : item;
      if (parsed.id === id) {
        await redis.lrem(QUESTIONS_KEY, 1, typeof item === 'string' ? item : JSON.stringify(item));
        break;
      }
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Question delete error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
