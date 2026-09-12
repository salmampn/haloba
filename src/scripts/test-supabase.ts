import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { supabaseAdmin } = await import("../lib/supabase/admin");

  const { count, error } = await supabaseAdmin
    .from("document_chunks")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Supabase check failed: ${error.message}`);
  }

  console.log("document_chunks count:", count);

  const { data, error: rowsError } = await supabaseAdmin
    .from("document_chunks")
    .select("chunk_index, content")
    .order("chunk_index");

  if (rowsError) {
    throw new Error(`Failed to load chunks: ${rowsError.message}`);
  }

  console.log("\nChunks:");
  for (const row of data ?? []) {
    console.log(`\nChunk ${row.chunk_index}:`);
    console.log(row.content);
  }
}

main().catch((error) => {
  console.error("Supabase test failed:");
  console.error(error);
  process.exit(1);
});