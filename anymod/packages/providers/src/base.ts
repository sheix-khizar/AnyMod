import type { StreamEvent, ChatMessage, ProviderConfig } from '@anymod/types';
import type { ProviderAdapter } from './types';
import { AuthError, RateLimitError, NetworkError, UnknownProviderError } from './errors';

export abstract class BaseProviderAdapter implements ProviderAdapter {
  abstract send(messages: ChatMessage[], config: ProviderConfig): Promise<string>;
  abstract stream(messages: ChatMessage[], config: ProviderConfig, onEvent: (event: StreamEvent) => void): Promise<void>;
  abstract countTokens(text: string, model: string): Promise<number>;
  abstract listModels(): Promise<string[]>;

  protected normalizeError(error: any): Error {
    if (error?.status === 401 || error?.status === 403) {
      return new AuthError('Authentication failed', error);
    }
    if (error?.status === 429) {
      return new RateLimitError('Rate limit exceeded', error);
    }
    if (error?.code === 'ECONNRESET' || error?.code === 'ENOTFOUND') {
      return new NetworkError('Network request failed', error);
    }
    return new UnknownProviderError(error?.message || 'Unknown error occurred', error);
  }
}
