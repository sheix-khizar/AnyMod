# @anymod/providers

This package defines the core abstractions for AI providers in AnyMod.

## Implemented Adapters
- **GroqAdapter**: Uses `@groq/groq-sdk` for lightning-fast inference.

## Contract
Any new provider must implement the `ProviderAdapter` interface defined in `src/types.ts`.

It must support:
- `send()`: Non-streaming completion.
- `stream()`: Streaming completion using the `StreamEvent` union from `@anymod/types`.
- `countTokens()`: Return the token count of a given text.
- `listModels()`: Return a list of supported models.

You should extend `BaseProviderAdapter` to get automatic error normalization.
