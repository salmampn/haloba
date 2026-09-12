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

const SIMILARITY_THRESHOLD = 0.7;
const MATCH_COUNT = 3;

export async function retrieveRelevantChunks(
  query: string
): Promise<RetrievalResult> {
  const embeddingResult = await createEmbedding(query);

  const { data, error } = await supabaseAdmin.rpc(
    "match_document_chunks",
    {
      query_embedding: embeddingResult.embedding,
      match_count: MATCH_COUNT,
    }
  );

  if (error) {
    throw new Error(`Vector search failed: ${error.message}`);
  }

  const chunks = ((data ?? []) as RetrievedChunk[]).filter(
    (chunk) => chunk.similarity >= SIMILARITY_THRESHOLD
  );

  return {
    chunks,
    embeddingUsage: embeddingResult.usage,
  };
}