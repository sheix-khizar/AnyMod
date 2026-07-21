import type { ToolCallRequest } from './schemas';

export type TextDeltaEvent = {
  type: 'text-delta';
  text: string;
};

export type ToolCallEvent = {
  type: 'tool-call';
  toolCall: ToolCallRequest;
};

export type ErrorEvent = {
  type: 'error';
  error: Error | string;
};

export type DoneEvent = {
  type: 'done';
};

export type StreamEvent = TextDeltaEvent | ToolCallEvent | ErrorEvent | DoneEvent;
