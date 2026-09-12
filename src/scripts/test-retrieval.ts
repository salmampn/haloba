import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { retrieveRelevantChunks } = await import("../lib/retrieval");

  const testQueries = [
  "Berapa hari cuti tahunan?",
  "Berapa batas reimbursement transportasi?",
  "Kapan bukti reimbursement harus dilampirkan?",
  "Berapa hari kerja hybrid dalam seminggu?",
  "Berapa tunjangan komunikasi?",
  "Apa aturan password akun kerja?",
  "Kapan laporan perjalanan dinas diserahkan?",
  "Berapa lama masa percobaan karyawan baru?",
  ];

  for (const query of testQueries) {
    const result = await retrieveRelevantChunks(query);

    console.log("\nQUERY:");
    console.log(query);

    console.log("\nEMBEDDING USAGE:");
    console.log(result.embeddingUsage);

    console.log(`\nRETRIEVED CHUNKS: ${result.chunks.length}`);

    for (const [index, chunk] of result.chunks.entries()) {
      console.log(`\n--- CHUNK ${index + 1} ---`);
      console.log(`Similarity: ${chunk.similarity}`);
      console.log(chunk.content);
    }
  }
}

main().catch((error) => {
  console.error("\nRetrieval test failed:");
  console.error(error);
  process.exit(1);
});