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
const SEMANTIC_CANDIDATE_COUNT = 5;

const MAX_CONTEXT_CHUNKS = 2;
const MAX_CONTEXT_CHARS = 2_000;

function selectChunksForContext(
  chunks: RetrievedChunk[]
): RetrievedChunk[] {
  const selectedChunks: RetrievedChunk[] = [];
  let totalChars = 0;

  const sortedChunks = [...chunks].sort(
    (a, b) => b.similarity - a.similarity
  );

  for (const chunk of sortedChunks) {
    if (selectedChunks.length >= MAX_CONTEXT_CHUNKS) {
      break;
    }

    const content = chunk.content.trim();

    if (!content) {
      continue;
    }

    if (totalChars + content.length > MAX_CONTEXT_CHARS) {
      continue;
    }

    selectedChunks.push({
      ...chunk,
      content,
    });

    totalChars += content.length;
  }

  return selectedChunks;
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
      match_count: SEMANTIC_CANDIDATE_COUNT,
    } as never
  );

  if (error) {
    throw new Error(`Vector search failed: ${error.message}`);
  }

  const semanticChunks = ((data ?? []) as RetrievedChunk[])
    .filter((chunk) => chunk.similarity >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity);

  return {
    chunks: selectChunksForContext(semanticChunks),
    embeddingUsage: embeddingResult.usage,
  };
}