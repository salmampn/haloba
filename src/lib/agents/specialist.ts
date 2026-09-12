import { ThinkingLevel } from "@google/genai";
import { gemini } from "@/lib/gemini";
import { retrieveRelevantChunks } from "@/lib/retrieval";
import type { AgentResult } from "@/lib/types";

const SIMPLE_FACT_MAX_CONTEXT_CHARS = 700;
const GENERAL_MAX_CONTEXT_CHARS = 2_000;

const SPECIALIST_MODEL =
  process.env.SPECIALIST_MODEL ?? "gemini-3.7-flash";

const NO_CONTEXT_ANSWER =
  "Saya tidak menemukan informasi terkait pertanyaan tersebut pada dokumen yang tersedia.";

const SPECIALIST_SYSTEM_INSTRUCTION = `
Kamu adalah Specialist Agent untuk knowledge base internal.

Aturan wajib:
- Gunakan hanya fakta yang tertulis pada CONTEXT.
- Jangan gunakan pengetahuan umum atau membuat fakta, angka, kebijakan, tanggal, maupun aturan baru.
- Jika CONTEXT tidak cukup untuk menjawab, katakan:
  "Saya tidak menemukan informasi tersebut pada dokumen yang tersedia."
- Gunakan Bahasa Indonesia.
- Jawab langsung sesuai cakupan pertanyaan pengguna.
- Untuk pertanyaan faktual sederhana, jawab dalam satu atau dua kalimat.
- Untuk aturan atau prosedur, jawab maksimal dua kalimat atau tiga bullet singkat.
- Jangan mengulang CONTEXT secara lengkap.
`;

function isSimpleFactQuestion(message: string) {
  return /\b(berapa|kapan|berapa\s+lama|berapa\s+hari|berapa\s+besar|batas|minimum|maksimal)\b/i.test(
    message
  );
}

function getSpecialistMaxOutputTokens(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (isSimpleFactQuestion(normalizedMessage)) {
    return 64;
  }

  const asksForExplanationOrList =
    /\b(jelaskan|rangkuman|ringkas|semua|apa\s+saja|bagaimana\s+prosedur|prosedur|langkah|ketentuan|aturan)\b/i.test(
      normalizedMessage
    );

  return asksForExplanationOrList ? 160 : 96;
}

function createNoContextResult(
  embeddingTokens: number
): AgentResult {
  return {
    answer: NO_CONTEXT_ANSWER,
    answeredBy: "specialist",
    model: "no-generation-needed",
    usage: {
      routerInputTokens: 0,
      routerOutputTokens: 0,
      embeddingTokens,
      llmInputTokens: 0,
      llmOutputTokens: 0,
      thoughtTokens: 0,
      totalTokens: embeddingTokens,
    },
  };
}

function truncateAtSentenceBoundary(
  text: string,
  maxChars: number
) {
  if (text.length <= maxChars) {
    return text;
  }

  const clipped = text.slice(0, maxChars);

  const lastSentenceEnd = Math.max(
    clipped.lastIndexOf(". "),
    clipped.lastIndexOf(".\n"),
    clipped.lastIndexOf("! "),
    clipped.lastIndexOf("!\n"),
    clipped.lastIndexOf("? "),
    clipped.lastIndexOf("?\n")
  );

  if (lastSentenceEnd >= Math.floor(maxChars * 0.55)) {
    return clipped.slice(0, lastSentenceEnd + 1).trim();
  }

  return `${clipped.trimEnd()}…`;
}

function buildContext(
  chunks: Array<{ content: string }>,
  maxChars: number
) {
  const sections: string[] = [];
  let totalChars = 0;

  for (const [index, chunk] of chunks.entries()) {
    const content = chunk.content.trim();

    if (!content || totalChars >= maxChars) {
      continue;
    }

    const label = `[Sumber ${index + 1}]\n`;

    const remainingChars =
      maxChars - totalChars - label.length;

    if (remainingChars <= 0) {
      break;
    }

    const clippedContent = truncateAtSentenceBoundary(
      content,
      remainingChars
    );

    if (!clippedContent) {
      continue;
    }

    sections.push(`${label}${clippedContent}`);

    totalChars += label.length + clippedContent.length;
  }

  return sections.join("\n\n");
}

export async function answerWithSpecialist(
  message: string
): Promise<AgentResult> {
  const { chunks, embeddingUsage } = await retrieveRelevantChunks(message);
  const embeddingTokens = embeddingUsage.totalTokens;

  // if (process.env.NODE_ENV !== "production") {
  //   console.log("SPECIALIST RETRIEVAL", {
  //     message,
  //     chunks: chunks.map((chunk) => ({
  //       similarity: chunk.similarity,
  //       preview: chunk.content.slice(0, 150),
  //     })),
  //   });
  // }

  if (chunks.length === 0) {
    return createNoContextResult(embeddingTokens);
  }

  const simpleFactQuestion = isSimpleFactQuestion(message);

  const selectedChunks = simpleFactQuestion
    ? chunks.slice(0, 1)
    : chunks.slice(0, 2);

  const context = buildContext(
    selectedChunks,
    simpleFactQuestion
      ? SIMPLE_FACT_MAX_CONTEXT_CHARS
      : GENERAL_MAX_CONTEXT_CHARS
  );

  if (!context) {
    return createNoContextResult(embeddingTokens);
  }

  const prompt = simpleFactQuestion
    ? `CONTEXT:
${context}

Jawab dalam satu kalimat.
PERTANYAAN: ${message}`
    : `CONTEXT:
${context}

PERTANYAAN: ${message}`;

  const response = await gemini.models.generateContent({
    model: SPECIALIST_MODEL,
    contents: prompt,
    config: {
      systemInstruction: SPECIALIST_SYSTEM_INSTRUCTION,
      maxOutputTokens: getSpecialistMaxOutputTokens(message),
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
      },
    },
  });

  const llmInputTokens =
    response.usageMetadata?.promptTokenCount ?? 0;

  const llmOutputTokens =
    response.usageMetadata?.candidatesTokenCount ?? 0;

  const thoughtTokens =
    response.usageMetadata?.thoughtsTokenCount ?? 0;

  const totalTokens =
    embeddingTokens +
    llmInputTokens +
    llmOutputTokens +
    thoughtTokens;

  return {
    answer: response.text?.trim() || NO_CONTEXT_ANSWER,
    answeredBy: "specialist",
    model: SPECIALIST_MODEL,
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