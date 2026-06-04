import { Redis } from '@upstash/redis';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

async function seed() {
  // Seed questions
  const questions = JSON.parse(readFileSync('data/questions.json', 'utf-8'));
  for (const q of questions) {
    await redis.lpush('questions', JSON.stringify(q));
  }
  console.log(`Seeded ${questions.length} questions`);

  // Seed reactions
  const reactions = JSON.parse(readFileSync('data/reactions.json', 'utf-8'));
  for (const [sectionId, counts] of Object.entries(reactions)) {
    for (const [reaction, count] of Object.entries(counts as Record<string, number>)) {
      await redis.hset(`reactions:${sectionId}`, { [reaction]: count });
    }
  }
  console.log(`Seeded reactions for ${Object.keys(reactions).length} sections`);
}

seed().then(() => console.log('Done!')).catch(console.error);
