import { BaseProviderAdapter } from '../base';
import type { ProviderConfig, ChatMessage, StreamEvent } from '@anymod/types';
import Groq from 'groq-sdk';
import { get_encoding } from 'tiktoken';

export class GroqAdapter extends BaseProviderAdapter {
  private getClient(config: ProviderConfig): Groq {
    return new Groq({
      apiKey: config.keyReference || process.env.GROQ_API_KEY || '',
      baseURL: config.baseUrl,
      dangerouslyAllowBrowser: true,
    });
  }

  async send(messages: ChatMessage[], config: ProviderConfig): Promise<string> {
    try {
      const client = this.getClient(config);
      const response = await client.chat.completions.create({
        model: config.defaultModel,
        messages: messages.map(msg => ({
          role: msg.role === 'tool' ? 'tool' : (msg.role as any),
          content: msg.content || '',
        })),
        stream: false,
      });
      return response.choices[0]?.message?.content || '';
    } catch (err) {
      throw this.normalizeError(err);
    }
  }

  async stream(messages: ChatMessage[], config: ProviderConfig, onEvent: (event: StreamEvent) => void): Promise<void> {
    try {
      const client = this.getClient(config);
      const stream = await client.chat.completions.create({
        model: config.defaultModel,
        messages: messages.map(msg => ({
          role: msg.role === 'tool' ? 'tool' : (msg.role as any),
          content: msg.content || '',
        })),
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          onEvent({ type: 'text-delta', text: delta.content });
        }

        if (delta?.tool_calls?.length) {
          for (const tc of delta.tool_calls) {
            onEvent({
              type: 'tool-call',
              toolCall: {
                id: tc.id || 'unknown',
                name: tc.function?.name || '',
                arguments: tc.function?.arguments ? JSON.parse(tc.function.arguments) : {}
              }
            });
          }
        }
      }
      onEvent({ type: 'done' });
    } catch (err) {
      onEvent({ type: 'error', error: this.normalizeError(err) });
    }
  }

  async countTokens(text: string, model: string): Promise<number> {
    // Groq-hosted Llama/Mixtral models don't have public tiktoken encodings.
    // cl100k_base is used as the closest available approximation for all of them.
    // If a model-specific encoding becomes available, branch on `model` here.
    const enc = get_encoding('cl100k_base');
    const tokens = enc.encode(text);
    const count = tokens.length;
    enc.free();
    void model; // intentionally unused for now — see comment above
    return count;
  }

  async listModels(): Promise<string[]> {
    // Verified against console.groq.com/docs/models — update this list if Groq's lineup changes.
    return [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'gemma2-9b-it',
    ];
  }
}
