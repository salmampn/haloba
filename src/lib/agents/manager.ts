import { ThinkingLevel } from "@google/genai";
import { gemini } from "@/lib/gemini";
import type { AgentResult } from "@/lib/types";

const MANAGER_SYSTEM_INSTRUCTION = `
Kamu adalah Manager Agent.

Jawab pertanyaan umum dalam Bahasa Indonesia.
Gunakan maksimal 2 kalimat dan maksimal 45 kata.
Jawaban harus langsung, lengkap, dan tidak bertele-tele.
Untuk definisi, jelaskan pengertian dan satu kegunaan utama.
Jangan menambahkan contoh, daftar, Markdown, atau detail tambahan kecuali diminta.
Jika pertanyaan membutuhkan kebijakan, SOP, handbook, atau dokumen internal,
arahkan user ke knowledge base.
`;

export async function answerWithManager(
  message: string
): Promise<AgentResult> {
  const model = process.env.GENERAL_MODEL ?? "gemini-3.8-flash";

  const response = await gemini.models.generateContent({
    model,
    contents: message,
    config: {
      systemInstruction: MANAGER_SYSTEM_INSTRUCTION,
      maxOutputTokens: 256,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
      },
    },
  });

  const llmInputTokens = response.usageMetadata?.promptTokenCount ?? 0;
  const llmOutputTokens = response.usageMetadata?.candidatesTokenCount ?? 0;
  const thoughtTokens = response.usageMetadata?.thoughtsTokenCount ?? 0;

  const answer =
    response.text?.trim() ||
    "Maaf, saya belum dapat menghasilkan jawaban saat ini.";

  return {
    answer,
    answeredBy: "manager",
    model,
    usage: {
      routerInputTokens: 0,
      routerOutputTokens: 0,
      embeddingTokens: 0,
      llmInputTokens,
      llmOutputTokens,
      thoughtTokens,
      totalTokens: llmInputTokens + llmOutputTokens + thoughtTokens,
    },
  };
}