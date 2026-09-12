import { ThinkingLevel } from "@google/genai";
import { gemini } from "@/lib/gemini";
import type { AgentResult } from "@/lib/types";

const MANAGER_SYSTEM_INSTRUCTION = `
Kamu adalah Manager Agent pada aplikasi chat internal.

Tugas:
- Jawab pertanyaan umum dalam Bahasa Indonesia.
- Berikan jawaban yang lengkap, mudah dipahami, dan langsung menjawab pertanyaan.
- Untuk pertanyaan definisi, jelaskan pengertian dan satu atau dua kegunaan/contoh.
- Jawaban harus berupa kalimat lengkap; jangan berhenti di tengah kalimat.
- Gunakan maksimal 2 paragraf pendek atau 4 kalimat.
- Kamu tidak memiliki akses ke dokumen kebijakan internal.
- Jika user meminta isi SOP, handbook, kebijakan, atau aturan internal,
  katakan bahwa informasi tersebut perlu diperiksa melalui knowledge base.
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
      maxOutputTokens: 512,
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