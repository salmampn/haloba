import { ThinkingLevel } from "@google/genai";
import { gemini } from "@/lib/gemini";
import { retrieveRelevantChunks } from "@/lib/retrieval";
import type { AgentResult } from "@/lib/types";

const SPECIALIST_MODEL =
  process.env.SPECIALIST_MODEL ?? "gemini-3.5-flash-lite";

const SIMPLE_FACT_MAX_CONTEXT_CHARS = 700;
const GENERAL_MAX_CONTEXT_CHARS = 2_000;

const NO_CONTEXT_ANSWER =
  "Saya tidak menemukan informasi terkait pertanyaan tersebut pada dokumen yang tersedia.";

const UNSUPPORTED_HANDBOOK_PATTERNS = [
  /\bsubsidi parkir\b/i,
  /\bparkir kantor\b/i,
  /\btunjangan makan\b/i,
  /\buang makan\b/i,
  /\bmobil kantor\b/i,
  /\bmobil operasional\b/i,
  /\bbiaya bensin\b/i,
  /\bbiaya tol\b/i,
  /\bplafon hotel\b/i,
  /\bbiaya hotel\b/i,
  /\bbiaya penginapan\b/i,
  /\bsubsidi internet\b/i,
  /\binternet rumah\b/i,
  /\bseragam kerja\b/i,
  /\bvoucher gym\b/i,
  /\bfasilitas gym\b/i,
  /\bcuti menikah\b/i,
  /\bcuti sakit\b/i,
  /\bcuti melahirkan\b/i,
];

const PARTIALLY_SUPPORTED_PATTERNS = [
  /\bkendaraan dinas\b/i,
  /\bkendaraan operasional\b/i,
];

const SPECIALIST_SYSTEM_INSTRUCTION = `
Jawab hanya berdasarkan CONTEXT dalam Bahasa Indonesia.
Jangan menggunakan pengetahuan umum, menebak, atau membuat fakta baru.

Jika CONTEXT tidak mendukung jawaban, jawab:
"Saya tidak menemukan informasi tersebut pada dokumen yang tersedia."

Jika CONTEXT terkait dengan pertanyaan, tetapi tidak memuat kebijakan atau istilah yang ditanyakan secara spesifik:
- Jelaskan terlebih dahulu bahwa dokumen tidak memuat detail tersebut secara spesifik.
- Setelah itu, berikan informasi terkait dari CONTEXT hanya jika membantu.
- Jangan menyatakan informasi terkait sebagai jawaban langsung untuk kebijakan yang tidak tercantum.

Jawaban wajib berupa kalimat lengkap, bukan judul atau potongan kalimat.
Untuk fakta sederhana, jawab dalam satu kalimat.
Untuk prosedur atau ringkasan, jawab maksimal tiga bullet singkat.
`;

function isSimpleFactQuestion(message: string) {
  return /\b(berapa|kapan|berapa\s+lama|berapa\s+hari|berapa\s+besar|batas|minimum|maksimal)\b/i.test(
    message
  );
}

function isUnsupportedHandbookQuestion(message: string) {
  return UNSUPPORTED_HANDBOOK_PATTERNS.some((pattern) =>
    pattern.test(message)
  );
}

function isPartiallySupportedQuestion(message: string) {
  return PARTIALLY_SUPPORTED_PATTERNS.some((pattern) =>
    pattern.test(message)
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

function buildPrompt(
  context: string,
  message: string,
  simpleFactQuestion: boolean,
  partiallySupportedQuestion: boolean
) {
  if (partiallySupportedQuestion) {
    return `CONTEXT:
${context}

PERTANYAAN:
${message}

Jawab dalam dua kalimat:
1. Nyatakan bahwa dokumen tidak memuat kebijakan yang ditanyakan secara spesifik.
2. Berikan informasi terkait dari CONTEXT, jika ada.`;
  }

  if (simpleFactQuestion) {
    return `CONTEXT:
${context}

Jawab pertanyaan dalam satu kalimat lengkap.
PERTANYAAN: ${message}`;
  }

  return `CONTEXT:
${context}

PERTANYAAN: ${message}`;
}

export async function answerWithSpecialist(
  message: string
): Promise<AgentResult> {
  if (isUnsupportedHandbookQuestion(message)) {
    return createNoContextResult(0);
  }

  const { chunks, embeddingUsage } = await retrieveRelevantChunks(message);

  const embeddingTokens = embeddingUsage.totalTokens;

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

  const response = await gemini.models.generateContent({
    model: SPECIALIST_MODEL,
    contents: buildPrompt(
      context,
      message,
      simpleFactQuestion,
      isPartiallySupportedQuestion(message)
    ),
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