import { GroqAdapter } from '../src/groq/adapter';
import type { ChatMessage, ProviderConfig } from '@anymod/types';
import fs from 'fs';
import path from 'path';

// Naive .env loader for the dev script
try {
  const envPath = path.resolve(process.cwd(), '.env');
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.replace(/^(['"])(.*)\1$/, '$2').trim();
      if (!process.env[key]) process.env[key] = value;
    }
  });
} catch (e) {
  // .env might not exist, ignore
}

async function main() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("Please set GROQ_API_KEY environment variable");
    process.exit(1);
  }

  const adapter = new GroqAdapter();
  const config: ProviderConfig = {
    id: 'groq',
    defaultModel: 'llama-3.1-8b-instant',
    keyReference: apiKey
  };

  const messages: ChatMessage[] = [
    { role: 'user', content: 'Say hello world!' }
  ];

  console.log("Starting stream...");
  const start = Date.now();
  let firstTokenTime = -1;

  await adapter.stream(messages, config, (event) => {
    if (event.type === 'text-delta') {
      if (firstTokenTime === -1) {
        firstTokenTime = Date.now();
        console.log(`\n[First token latency: ${firstTokenTime - start}ms]`);
      }
      process.stdout.write(event.text);
    } else if (event.type === 'done') {
      console.log("\n[Stream complete]");
    } else if (event.type === 'error') {
      console.error("\nError:", event.error);
    }
  });
}

main().catch(console.error);
