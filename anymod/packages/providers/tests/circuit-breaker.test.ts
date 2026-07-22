import { describe, it, expect } from 'vitest';
import { CircuitBreaker } from '../src/circuit-breaker';

describe('CircuitBreaker', () => {
  it('opens after threshold and fails fast', async () => {
    const breaker = new CircuitBreaker('test', { failureThreshold: 3, cooldownMs: 30000 });
    let calls = 0;

    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(async () => {
        calls++;
        throw new Error('fail');
      })).rejects.toThrow('fail');
    }

    expect(breaker.getState()).toBe('open');

    await expect(breaker.execute(async () => {
      calls++;
      return 'ok';
    })).rejects.toThrow(/OPEN/);

    expect(calls).toBe(3); // 4th call never executed fn
  });
});
