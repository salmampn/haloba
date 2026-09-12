import type { AgentName } from "@/lib/types";

export type RouteDecision = {
  agent: AgentName;
  reason: string;
};

const SPECIALIST_PATTERNS = [
  // Referensi eksplisit ke knowledge base atau dokumen internal
  /\bdokumen\b/i,
  /\bfile\b/i,
  /\bhandbook\b/i,
  /\bpanduan\b/i,
  /\bsop\b/i,
  /\bknowledge\s*base\b/i,
  /\bkebijakan\b/i,
  /\baturan\b/i,
  /\bperaturan\b/i,

  // Cuti, jam kerja, dan kerja hybrid
  /\bcuti\b/i,
  /\bcuti tahunan\b/i,
  /\bcuti pengganti\b/i,
  /\bjam kerja\b/i,
  /\bwaktu istirahat\b/i,
  /\bhybrid\b/i,
  /\bwfh\b/i,
  /\bwfo\b/i,
  /\bhari kerja\b/i,

  // Reimbursement dan perjalanan dinas
  /\breimbursement\b/i,
  /\breimburse\b/i,
  /\bpenggantian biaya\b/i,
  /\btransportasi\b/i,
  /\bbiaya perjalanan\b/i,
  /\bperjalanan dinas\b/i,
  /\bdinas\b/i,
  /\btiket\b/i,
  /\bakomodasi\b/i,
  /\bhotel\b/i,
  /\blaporan perjalanan\b/i,
  /\bbukti pembayaran\b/i,
  /\bbiaya di luar anggaran\b/i,

  // Peralatan kerja
  /\blaptop\b/i,
  /\bperalatan kerja\b/i,
  /\bperangkat kerja\b/i,
  /\bperangkat perusahaan\b/i,
  /\bpinjam perangkat\b/i,
  /\bpengembalian laptop\b/i,

  // Benefit dan kompensasi
  /\bgaji\b/i,
  /\bslip gaji\b/i,
  /\bkompensasi\b/i,
  /\bbenefit\b/i,
  /\btunjangan\b/i,
  /\btunjangan komunikasi\b/i,
  /\bbonus\b/i,
  /\bbonus kinerja\b/i,
  /\binsentif\b/i,
  /\basuransi\b/i,
  /\basuransi kesehatan\b/i,
  /\bbpjs\b/i,
  /\bbpjs kesehatan\b/i,
  /\bbpjs ketenagakerjaan\b/i,

  // Lembur dan hari libur
  /\blembur\b/i,
  /\buang lembur\b/i,
  /\bkompensasi lembur\b/i,
  /\bhari libur\b/i,
  /\blibur nasional\b/i,
  /\bkerja di hari libur\b/i,

  // Keamanan data dan perangkat
  /\bpassword\b/i,
  /\bkata sandi\b/i,
  /\bautentikasi dua faktor\b/i,
  /\b2fa\b/i,
  /\bmfa\b/i,
  /\bemail perusahaan\b/i,
  /\bdata internal\b/i,
  /\bdata pelanggan\b/i,
  /\bdata karyawan\b/i,
  /\bdokumen sensitif\b/i,
  /\bkeamanan data\b/i,
  /\bkebocoran data\b/i,
  /\bphishing\b/i,
  /\bakses tidak sah\b/i,
  /\binsiden keamanan\b/i,
  /\bperangkat hilang\b/i,
  /\bperangkat rusak\b/i,
  /\bsoftware ilegal\b/i,

  // Onboarding dan masa percobaan
  /\bonboarding\b/i,
  /\borientasi\b/i,
  /\bkaryawan baru\b/i,
  /\bhari pertama\b/i,
  /\bdokumen administrasi\b/i,
  /\bdata rekening\b/i,
  /\bnpwp\b/i,
  /\bakun kerja\b/i,
  /\bakun sistem\b/i,
  /\bmasa percobaan\b/i,
  /\bprobation\b/i,
  /\bevaluasi karyawan\b/i,
  /\bpeople operations\b/i,
];

function findMatchedPattern(message: string) {
  return SPECIALIST_PATTERNS.find((pattern) => pattern.test(message));
}

export function decideAgent(message: string): RouteDecision {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    return {
      agent: "manager",
      reason: "Empty message defaults to Manager.",
    };
  }

  const matchedPattern = findMatchedPattern(normalizedMessage);

  if (matchedPattern) {
    return {
      agent: "specialist",
      reason: `Matched handbook topic: ${matchedPattern.source}`,
    };
  }

  return {
    agent: "manager",
    reason: "No employee handbook topic was found.",
  };
}