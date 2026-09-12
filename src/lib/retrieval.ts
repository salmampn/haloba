import { createEmbedding } from "@/lib/embeddings";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type RetrievedChunk = {
  id: string;
  document_id: string;
  content: string;
  similarity: number;
};

export type RetrievalResult = {
  chunks: RetrievedChunk[];
  embeddingUsage: {
    inputTokens: number;
    totalTokens: number;
  };
};

const SIMILARITY_THRESHOLD = 0.5;
const MATCH_COUNT = 3;

function getKeywords(query: string) {
  const stopWords = new Set([
    "apa",
    "apakah",
    "adalah",
    "berapa",
    "bagaimana",
    "kapan",
    "dimana",
    "di",
    "ke",
    "dari",
    "dan",
    "atau",
    "untuk",
    "yang",
    "ini",
    "itu",
    "saya",
    "kami",
    "karyawan",
    "perusahaan",
  ]);

  return query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !stopWords.has(word));
}

function scoreLexicalMatch(content: string, keywords: string[]) {
  const normalizedContent = content.toLowerCase();

  return keywords.reduce((score, keyword) => {
    return normalizedContent.includes(keyword) ? score + 1 : score;
  }, 0);
}

async function lexicalFallback(query: string): Promise<RetrievedChunk[]> {
  const keywords = getKeywords(query);

  if (keywords.length === 0) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("document_chunks")
    .select("id, document_id, content");

  if (error) {
    throw new Error(`Lexical fallback failed: ${error.message}`);
  }

  return (data ?? [])
    .map((chunk) => ({
      ...chunk,
      similarity: scoreLexicalMatch(chunk.content, keywords),
    }))
    .filter((chunk) => chunk.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, MATCH_COUNT);
}

export async function retrieveRelevantChunks(
  query: string
): Promise<RetrievalResult> {
  const embeddingResult = await createEmbedding(query);

  const queryEmbedding = `[${embeddingResult.embedding.join(",")}]`;

  const { data, error } = await supabaseAdmin.rpc(
    "match_document_chunks",
    {
      query_embedding: queryEmbedding,
      match_count: MATCH_COUNT,
    } as never
  );

  if (error) {
    throw new Error(`Vector search failed: ${error.message}`);
  }

  const rawSemanticChunks = (data ?? []) as RetrievedChunk[];

  // if (process.env.NODE_ENV !== "production") {
  //   console.log("\nRAW SEMANTIC RETRIEVAL RESULTS:");

  //   for (const chunk of rawSemanticChunks) {
  //     console.log({
  //       similarity: chunk.similarity,
  //       preview: chunk.content.slice(0, 160),
  //     });
  //   }
  // }

  const semanticChunks = rawSemanticChunks.filter(
    (chunk) => chunk.similarity >= SIMILARITY_THRESHOLD
  );

  if (semanticChunks.length > 0) {
    return {
      chunks: semanticChunks,
      embeddingUsage: embeddingResult.usage,
    };
  }

  const fallbackChunks = await lexicalFallback(query);

  // if (process.env.NODE_ENV !== "production") {
  //   console.log("\nLEXICAL FALLBACK RESULTS:");

  //   for (const chunk of fallbackChunks) {
  //     console.log({
  //       lexicalScore: chunk.similarity,
  //       preview: chunk.content.slice(0, 160),
  //     });
  //   }
  // }

  return {
    chunks: fallbackChunks,
    embeddingUsage: embeddingResult.usage,
  };
}