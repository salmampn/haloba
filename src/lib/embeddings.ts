import { gemini } from "@/lib/gemini";

export type EmbeddingResult = {
  embedding: number[];
  usage: {
    inputTokens: number;
    totalTokens: number;
  };
};

export async function createEmbedding(
  text: string
): Promise<EmbeddingResult> {
  const response = await gemini.models.embedContent({
    model: process.env.EMBEDDING_MODEL!,
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding || embedding.length === 0) {
    throw new Error("Gemini did not return an embedding.");
  }

  if (embedding.length !== 768) {
    throw new Error(
      `Expected embedding dimension 768, but received ${embedding.length}.`
    );
  }

  return {
    embedding,
    usage: {
      inputTokens: 0,
      totalTokens: 0,
    },
  };
}