export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class AuthError extends ProviderError {
  constructor(message: string = 'Authentication failed', originalError?: unknown) {
    super(message, false, originalError); // never retry a bad API key
    this.name = 'AuthError';
  }
}

export class RateLimitError extends ProviderError {
  constructor(message: string = 'Rate limit exceeded', originalError?: unknown) {
    super(message, true, originalError); // always retryable
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends ProviderError {
  constructor(message: string = 'Network error', originalError?: unknown) {
    super(message, true, originalError); // transient, retry
    this.name = 'NetworkError';
  }
}

export class UnknownProviderError extends ProviderError {
  constructor(message: string = 'Unknown provider error', originalError?: unknown) {
    super(message, false, originalError); // unknown shape — don't assume it's safe to retry
    this.name = 'UnknownProviderError';
  }
}
