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

export async function retrieveRelevantChunks(
  query: string
): Promise<RetrievalResult> {
  const embeddingResult = await createEmbedding(query);

  console.log(
    "Query embedding dimensions:",
    embeddingResult.embedding.length
  );

  const queryEmbedding = `[${embeddingResult.embedding.join(",")}]`;

  const { data, error } = await supabaseAdmin.rpc(
    "match_document_chunks",
    {
      query_embedding: queryEmbedding,
      match_count: MATCH_COUNT,
    }
  );

  if (error) {
    throw new Error(`Vector search failed: ${error.message}`);
  }

  const rawChunks = (data ?? []) as RetrievedChunk[];

  console.log("\nRAW RETRIEVAL RESULTS:");
  for (const chunk of rawChunks) {
    console.log({
      similarity: chunk.similarity,
      preview: chunk.content.slice(0, 160),
    });
  }

  const chunks = rawChunks.filter(
    (chunk) => chunk.similarity >= SIMILARITY_THRESHOLD
  );

  return {
    chunks,
    embeddingUsage: embeddingResult.usage,
  };
}