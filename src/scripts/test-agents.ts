import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { decideAgent } = await import("../lib/agents/router");
  const { answerWithManager } = await import("../lib/agents/manager");
  const { answerWithSpecialist } = await import("../lib/agents/specialist");

  const testQueries = [
    // "Apa itu Next.js?",
    "Berapa hari cuti tahunan karyawan?",
    // "Berapa batas reimbursement transportasi?",
    "Jam kerja dimulai pukul berapa?",
    // "Apakah perusahaan memberikan bonus saham tahunan?",
  ];

  for (const query of testQueries) {
    const decision = decideAgent(query);

    console.log("\n==================================");
    console.log("QUESTION:", query);
    console.log("ROUTED TO:", decision.agent);
    console.log("REASON:", decision.reason);

    const result =
      decision.agent === "manager"
        ? await answerWithManager(query)
        : await answerWithSpecialist(query);

    console.log("\nANSWER:");
    console.log(result.answer);

    console.log("\nANSWERED BY:", result.answeredBy);
    console.log("MODEL:", result.model);
    console.log("TOKEN USAGE:", result.usage);
  }
}

main().catch((error) => {
  console.error("\nAgent test failed:");
  console.error(error);
  process.exit(1);
});