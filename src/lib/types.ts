export type AgentName = "manager" | "specialist";

export type TokenUsage = {
  routerInputTokens: number;
  routerOutputTokens: number;

  embeddingTokens: number;

  llmInputTokens: number;
  llmOutputTokens: number;

  thoughtTokens: number;
  totalTokens: number;
};

export type AgentResult = {
  answer: string;
  answeredBy: AgentName;
  model: string;
  usage: TokenUsage;
};

export type ChatMessageRole = "user" | "assistant" | "error";

export type ChatMessageItem = {
  id: string;
  role: ChatMessageRole;
  content: string;
  answeredBy?: AgentName;
  usage?: TokenUsage;
  responseTimeMs?: number;
};

export type ChatApiResponse = {
  conversationId?: string;
  answer?: string;
  answeredBy?: AgentName;
  model?: string;
  usage?: TokenUsage;
  responseTimeMs?: number;
  error?: string;
};