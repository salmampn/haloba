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