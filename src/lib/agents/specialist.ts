import { ThinkingLevel } from "@google/genai";
import { gemini } from "@/lib/gemini";
import { retrieveRelevantChunks } from "@/lib/retrieval";
import type { AgentResult } from "@/lib/types";

const SPECIALIST_SYSTEM_INSTRUCTION = `
Kamu adalah Specialist Agent yang menjawab pertanyaan berdasarkan
knowledge base internal.

Aturan wajib:
- Gunakan hanya informasi yang terdapat di CONTEXT.
- Jangan membuat fakta, angka, kebijakan, tanggal, atau aturan baru yang tidak ada pada CONTEXT.
- Jika jawaban tidak ada di CONTEXT, katakan:
  "Saya tidak menemukan informasi tersebut pada dokumen yang tersedia."
- Gunakan Bahasa Indonesia.
- Jawab maksimal empat kalimat.
`;

export async function answerWithSpecialist(
  message: string
): Promise<AgentResult> {
  const { chunks, embeddingUsage } = await retrieveRelevantChunks(message);

  if (chunks.length === 0) {
    const fallbackAnswer =
      "Saya tidak menemukan informasi tersebut pada dokumen yang tersedia.";

    return {
      answer: fallbackAnswer,
      answeredBy: "specialist",
      model: "no-generation-needed",
      usage: {
        routerInputTokens: 0,
        routerOutputTokens: 0,

        embeddingTokens: embeddingUsage.totalTokens,

        llmInputTokens: 0,
        llmOutputTokens: 0,
        thoughtTokens: 0,

        totalTokens: embeddingUsage.totalTokens,
      },
    };
  }

  const context = chunks
    .map(
      (chunk, index) =>
        `[Sumber ${index + 1} | Similarity: ${chunk.similarity.toFixed(3)}]\n${chunk.content}`
    )
    .join("\n\n");

  const prompt = `
CONTEXT:
${context}

PERTANYAAN USER:
${message}
`;

  const response = await gemini.models.generateContent({
    model: process.env.SPECIALIST_MODEL ?? "gemini-3.7-flash",
    contents: prompt,
    config: {
    systemInstruction: SPECIALIST_SYSTEM_INSTRUCTION,
    maxOutputTokens: 128,
    thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
    },
    },
  });

  const llmInputTokens = response.usageMetadata?.promptTokenCount ?? 0;
  const llmOutputTokens = response.usageMetadata?.candidatesTokenCount ?? 0;
  const thoughtTokens = response.usageMetadata?.thoughtsTokenCount ?? 0;

  const embeddingTokens = embeddingUsage.totalTokens;
  const totalTokens =
    embeddingTokens +
    llmInputTokens +
    llmOutputTokens +
    thoughtTokens;

  return {
    answer:
      response.text?.trim() ||
      "Saya tidak menemukan informasi tersebut pada dokumen yang tersedia.",
    answeredBy: "specialist",
    model: process.env.SPECIALIST_MODEL ?? "gemini-3.7-flash",
    usage: {
      routerInputTokens: 0,
      routerOutputTokens: 0,

      embeddingTokens,

      llmInputTokens,
      llmOutputTokens,
      thoughtTokens,

      totalTokens,
    },
  };
}