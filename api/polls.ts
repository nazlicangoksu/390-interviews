import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const POLLS_PREFIX = 'polls:';
const POLLS_SET = 'polls:_ids';
const ID_RE = /^[a-z0-9_-]{1,40}$/i;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const pollIds: string[] = await redis.smembers(POLLS_SET);
      const result: Record<string, Record<string, number>> = {};
      for (const pollId of pollIds) {
        const data = await redis.hgetall(`${POLLS_PREFIX}${pollId}`);
        if (data && Object.keys(data).length > 0) {
          result[pollId] = {};
          for (const [optionId, count] of Object.entries(data)) {
            result[pollId][optionId] = Number(count);
          }
        }
      }
      return res.json(result);
    }

    if (req.method === 'POST') {
      const { pollId, optionId } = req.body || {};
      if (!ID_RE.test(pollId || '') || !ID_RE.test(optionId || '')) {
        return res.status(400).json({ error: 'valid pollId and optionId required' });
      }
      await redis.sadd(POLLS_SET, pollId);
      await redis.hincrby(`${POLLS_PREFIX}${pollId}`, optionId, 1);
      const updated = await redis.hgetall(`${POLLS_PREFIX}${pollId}`);
      const counts: Record<string, number> = {};
      if (updated) {
        for (const [o, c] of Object.entries(updated)) counts[o] = Number(c);
      }
      return res.json(counts);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Polls API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
