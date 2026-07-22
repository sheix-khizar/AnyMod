import { ProviderError } from './errors';

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 500,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries, baseDelayMs } = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const retryable = err instanceof ProviderError ? err.retryable : false;

      if (!retryable || attempt === maxRetries) {
        throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt); // 500, 1000, 2000...
      await sleep(delay);
    }
  }

  throw lastError; // unreachable, satisfies TypeScript
}
