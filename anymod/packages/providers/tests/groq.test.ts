import { describe, it, expect } from 'vitest';
import { GroqAdapter } from '../src/groq/adapter';

describe('GroqAdapter', () => {
  it('instantiates correctly', () => {
    const adapter = new GroqAdapter();
    expect(adapter).toBeDefined();
  });

  it('lists models', async () => {
    const adapter = new GroqAdapter();
    const models = await adapter.listModels();
    expect(models).toContain('llama-3.1-8b-instant');
  });
  
  it('counts tokens (approx)', async () => {
    const adapter = new GroqAdapter();
    const count = await adapter.countTokens("hello world", "llama-3.1-8b-instant");
    expect(count).toBeGreaterThan(0);
  });
});
