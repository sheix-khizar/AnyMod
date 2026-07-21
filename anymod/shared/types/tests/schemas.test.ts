import { describe, it, expect } from 'vitest';
import { ChatMessageSchema, ProviderConfigSchema } from '../src/schemas';

describe('Zod Schemas', () => {
  it('validates ProviderConfig correctly', () => {
    const validConfig = {
      id: 'openai',
      defaultModel: 'gpt-4o',
    };
    expect(ProviderConfigSchema.parse(validConfig)).toEqual(validConfig);

    const invalidConfig = {
      id: 'openai',
      // missing defaultModel
    };
    expect(() => ProviderConfigSchema.parse(invalidConfig)).toThrow();
  });

  it('validates ChatMessage correctly', () => {
    const validMessage = {
      role: 'user',
      content: 'Hello',
    };
    expect(ChatMessageSchema.parse(validMessage)).toEqual(validMessage);

    const invalidMessage = {
      role: 'invalid-role',
      content: 'Hello',
    };
    expect(() => ChatMessageSchema.parse(invalidMessage)).toThrow();
  });
});
