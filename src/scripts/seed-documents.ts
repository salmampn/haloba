import { loadEnvConfig } from "@next/env";
import fs from "node:fs";
import path from "node:path";

loadEnvConfig(process.cwd());

function chunkText(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 40);
}

async function seedDocument() {
  const { createEmbedding } = await import("../lib/embeddings");
  const { supabaseAdmin } = await import("../lib/supabase/admin");

  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "employee-handbook.txt"
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Document not found. Create this file first: ${filePath}`
    );
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const chunks = chunkText(rawContent);

  if (chunks.length === 0) {
    throw new Error("No valid chunks were created from the document.");
  }

  const { data: document, error: documentError } = await supabaseAdmin
    .from("documents")
    .insert({
      title: "Panduan Karyawan Mini",
      source: "src/data/employee-handbook.txt",
      raw_content: rawContent,
    })
    .select("id")
    .single();

  if (documentError || !document) {
    throw new Error(
      `Failed to insert document: ${
        documentError?.message ?? "Unknown error"
      }`
    );
  }

  for (const [index, content] of chunks.entries()) {
    const { embedding } = await createEmbedding(content);

    const { error: chunkError } = await supabaseAdmin
      .from("document_chunks")
      .insert({
        document_id: document.id,
        chunk_index: index,
        content,
        embedding,
      });

    if (chunkError) {
      throw new Error(
        `Failed to insert chunk ${index + 1}: ${chunkError.message}`
      );
    }

    console.log(`Inserted chunk ${index + 1}/${chunks.length}`);
  }

  console.log("Document seeding completed successfully.");
}

seedDocument().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});