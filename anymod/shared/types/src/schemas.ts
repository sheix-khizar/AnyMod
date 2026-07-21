import { z } from 'zod';

export const ProviderConfigSchema = z.object({
  id: z.string(),
  baseUrl: z.string().optional(),
  defaultModel: z.string(),
  keyReference: z.string().optional(),
});
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

export const ToolCallRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.record(z.any()), // parsed JSON arguments
});
export type ToolCallRequest = z.infer<typeof ToolCallRequestSchema>;

export const ToolCallResultSchema = z.object({
  toolCallId: z.string(),
  result: z.string(),
  isError: z.boolean().optional(),
});
export type ToolCallResult = z.infer<typeof ToolCallResultSchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string().optional(),
  toolCalls: z.array(ToolCallRequestSchema).optional(),
  toolCallId: z.string().optional(), // if role is 'tool'
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
