import type { StreamEvent, ChatMessage, ProviderConfig } from '@anymod/types';

export interface ProviderAdapter {
  send(messages: ChatMessage[], config: ProviderConfig): Promise<string>;
  stream(messages: ChatMessage[], config: ProviderConfig, onEvent: (event: StreamEvent) => void): Promise<void>;
  countTokens(text: string, model: string): Promise<number>;
  listModels(): Promise<string[]>;
}
