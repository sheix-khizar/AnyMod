import type { ProviderAdapter } from './types';
import { GroqAdapter } from './groq/adapter';
import { withRetry } from './retry';
import { CircuitBreaker } from './circuit-breaker';
import type { ChatMessage, ProviderConfig } from '@anymod/types';

export type ProviderId = 'groq' | 'anthropic' | 'ollama' | 'openai';

class ProviderRegistry {
  private adapters = new Map<ProviderId, ProviderAdapter>();

  register(id: ProviderId, adapter: ProviderAdapter): void {
    if (this.adapters.has(id)) {
      throw new Error(`Provider "${id}" is already registered`);
    }
    this.adapters.set(id, adapter);
  }

  get(id: ProviderId): ProviderAdapter {
    const adapter = this.adapters.get(id);
    if (!adapter) {
      throw new Error(`No provider registered for "${id}". Registered: ${[...this.adapters.keys()].join(', ')}`);
    }
    return adapter;
  }

  list(): ProviderId[] {
    return [...this.adapters.keys()];
  }
}

// Singleton registry, populated once at module load.
export const providerRegistry = new ProviderRegistry();
providerRegistry.register('groq', new GroqAdapter());

const breakers = new Map<ProviderId, CircuitBreaker>();

function getBreaker(id: ProviderId): CircuitBreaker {
  if (!breakers.has(id)) {
    breakers.set(id, new CircuitBreaker(id));
  }
  return breakers.get(id)!;
}

// Resilient send: goes through both the circuit breaker and retry logic.
// Use this from the chat handler instead of calling adapter.send() directly.
export async function resilientSend(
  id: ProviderId,
  messages: ChatMessage[],
  config: ProviderConfig
): Promise<string> {
  const adapter = providerRegistry.get(id);
  const breaker = getBreaker(id);
  return breaker.execute(() => withRetry(() => adapter.send(messages, config)));
}
