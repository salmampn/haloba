import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { gemini } = await import("../lib/gemini");

  const response = await gemini.models.generateContent({
    model: process.env.MANAGER_MODEL ?? "gemini-3.8-flash",
    contents: "Balas hanya dengan kata: siap",
  });

  console.log(response.text);
  console.log(response.usageMetadata);
}

main().catch((error) => {
  console.error("Gemini test failed:");
  console.error(error);
  process.exit(1);
});