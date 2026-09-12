import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { supabaseAdmin } = await import("../lib/supabase/admin");

  const { data: rows, error: rowsError } = await supabaseAdmin
    .from("document_chunks")
    .select("id, content, embedding")
    .order("chunk_index")
    .limit(1);

  if (rowsError) {
    throw new Error(`Failed to read document chunk: ${rowsError.message}`);
  }

  const firstChunk = rows?.[0];

  if (!firstChunk) {
    throw new Error("No document chunk found.");
  }

  console.log("Testing RPC using chunk's own embedding...");
  console.log("Chunk preview:", firstChunk.content.slice(0, 120));

  const { data, error } = await supabaseAdmin.rpc(
    "match_document_chunks",
    {
      query_embedding: firstChunk.embedding,
      match_count: 3,
    }
  );

  console.log("\nRPC ERROR:");
  console.dir(error, { depth: null });

  console.log("\nRPC DATA:");
  console.dir(data, { depth: null });
}

main().catch((error) => {
  console.error("RPC test failed:");
  console.error(error);
  process.exit(1);
});