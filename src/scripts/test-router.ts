import { decideAgent } from "../lib/agents/router";

const testCases = [
  "Berapa hari cuti tahunan?",
  "Berapa batas reimbursement transportasi?",
  "Kapan bukti pembayaran harus dilampirkan?",
  "Berapa hari kerja hybrid dalam seminggu?",
  "Apakah karyawan mendapat tunjangan komunikasi?",
  "Apa aturan BPJS Kesehatan?",
  "Apakah lembur harus disetujui atasan?",
  "Kapan laporan perjalanan dinas diserahkan?",
  "Berapa karakter minimal password akun kerja?",
  "Bagaimana melaporkan email phishing?",
  "Berapa lama masa percobaan karyawan baru?",
  "Apa itu React Server Components?",
  "Bagaimana cara membuat array di TypeScript?",
];

for (const message of testCases) {
  const decision = decideAgent(message);

  console.log({
    message,
    agent: decision.agent,
    reason: decision.reason,
  });
}