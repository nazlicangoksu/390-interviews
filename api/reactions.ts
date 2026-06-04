import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const REACTIONS_PREFIX = 'reactions:';
const SECTIONS_SET = 'reactions:_sections';
const ALLOWED_REACTIONS = ['surprising', 'seen-this', 'tell-more'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const sectionIds: string[] = await redis.smembers(SECTIONS_SET);
      const result: Record<string, Record<string, number>> = {};
      for (const sectionId of sectionIds) {
        const data = await redis.hgetall(`${REACTIONS_PREFIX}${sectionId}`);
        if (data && Object.keys(data).length > 0) {
          result[sectionId] = {};
          for (const [reaction, count] of Object.entries(data)) {
            result[sectionId][reaction] = Number(count);
          }
        }
      }
      return res.json(result);
    }

    if (req.method === 'POST') {
      const { sectionId, reaction } = req.body;
      if (!sectionId || !reaction || !ALLOWED_REACTIONS.includes(reaction)) {
        return res.status(400).json({ error: 'sectionId and valid reaction required' });
      }
      // Track this section and atomically increment
      await redis.sadd(SECTIONS_SET, sectionId);
      await redis.hincrby(`${REACTIONS_PREFIX}${sectionId}`, reaction, 1);
      const updated = await redis.hgetall(`${REACTIONS_PREFIX}${sectionId}`);
      const counts: Record<string, number> = {};
      if (updated) {
        for (const [r, c] of Object.entries(updated)) {
          counts[r] = Number(c);
        }
      }
      return res.json(counts);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Reactions API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
