import { describe, it, expect } from 'vitest';
import { withRetry } from '../src/retry';
import { RateLimitError, AuthError } from '../src/errors';

describe('withRetry', () => {
  it('succeeds after transient failures', async () => {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts++;
      if (attempts < 3) throw new RateLimitError();
      return 'success';
    }, { baseDelayMs: 1 });
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('fails immediately on non-retryable error', async () => {
    let attempts = 0;
    await expect(withRetry(async () => {
      attempts++;
      throw new AuthError();
    }, { baseDelayMs: 1 })).rejects.toThrow(AuthError);
    expect(attempts).toBe(1);
  });
});
