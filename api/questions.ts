import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const QUESTIONS_KEY = 'questions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const raw: string[] = await redis.lrange(QUESTIONS_KEY, 0, -1);
      const questions = raw.map((item) =>
        typeof item === 'string' ? JSON.parse(item) : item
      );
      const sectionId = req.query.sectionId as string | undefined;
      return res.json(
        sectionId ? questions.filter((q: any) => q.sectionId === sectionId) : questions
      );
    }

    if (req.method === 'POST') {
      const { sectionId, text, author } = req.body;
      if (!sectionId || !text) {
        return res.status(400).json({ error: 'sectionId and text are required' });
      }
      const question = {
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sectionId,
        text: text.trim(),
        author: author?.trim() || 'Anonymous',
        timestamp: new Date().toISOString(),
      };
      await redis.lpush(QUESTIONS_KEY, JSON.stringify(question));
      return res.status(201).json(question);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Questions API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
