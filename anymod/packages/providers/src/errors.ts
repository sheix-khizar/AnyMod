export class ProviderError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class AuthError extends ProviderError {
  constructor(message: string = 'Authentication failed', originalError?: unknown) {
    super(message, originalError);
    this.name = 'AuthError';
  }
}

export class RateLimitError extends ProviderError {
  constructor(message: string = 'Rate limit exceeded', originalError?: unknown) {
    super(message, originalError);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends ProviderError {
  constructor(message: string = 'Network error', originalError?: unknown) {
    super(message, originalError);
    this.name = 'NetworkError';
  }
}

export class UnknownProviderError extends ProviderError {
  constructor(message: string = 'Unknown provider error', originalError?: unknown) {
    super(message, originalError);
    this.name = 'UnknownProviderError';
  }
}
