type BreakerState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  failureThreshold?: number; // consecutive failures before opening
  cooldownMs?: number;       // how long to stay open before trying again
}

const DEFAULTS: Required<CircuitBreakerOptions> = {
  failureThreshold: 5,
  cooldownMs: 30_000,
};

export class CircuitBreaker {
  private state: BreakerState = 'closed';
  private consecutiveFailures = 0;
  private openedAt: number | null = null;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(
    private readonly providerId: string,
    options: CircuitBreakerOptions = {}
  ) {
    this.options = { ...DEFAULTS, ...options };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const elapsed = Date.now() - (this.openedAt ?? 0);
      if (elapsed < this.options.cooldownMs) {
        throw new Error(
          `Circuit breaker OPEN for "${this.providerId}" — failing fast (${Math.round(
            (this.options.cooldownMs - elapsed) / 1000
          )}s remaining in cooldown)`
        );
      }
      this.state = 'half-open';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    this.consecutiveFailures = 0;
    this.state = 'closed';
    this.openedAt = null;
  }

  private onFailure(): void {
    this.consecutiveFailures++;
    if (this.state === 'half-open' || this.consecutiveFailures >= this.options.failureThreshold) {
      this.state = 'open';
      this.openedAt = Date.now();
    }
  }

  getState(): BreakerState {
    return this.state;
  }
}
