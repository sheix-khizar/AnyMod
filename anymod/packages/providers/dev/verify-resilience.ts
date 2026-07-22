import 'dotenv/config';
import { resilientSend } from '../src/registry';
import type { ChatMessage, ProviderConfig } from '@anymod/types';

async function main() {
  const config: ProviderConfig = {
    providerId: 'groq',
    defaultModel: 'llama-3.1-8b-instant',
    keyReference: process.env.GROQ_API_KEY,
  } as any; // casting as any because ProviderConfig might differ slightly based on type definitions
  const messages: ChatMessage[] = [{ id: '1', role: 'user', content: 'Say hello in 3 words.', createdAt: Date.now() }];

  const result = await resilientSend('groq', messages, config);
  console.log('Resilient send result:', result);

  // Bonus: rate-limit test
  console.log('\n--- Rapid-fire test ---');
  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(resilientSend('groq', messages, config).catch(e => `Error: ${e.message}`));
  }
  const results = await Promise.all(promises);
  console.log('Rapid-fire completed. Received', results.filter(r => !r.startsWith('Error')).length, 'successes.');
}

main().catch(console.error);
