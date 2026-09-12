import type { AgentName } from "@/lib/types";

const SPECIALIST_KEYWORDS = [
  "dokumen",
  "file",
  "handbook",
  "panduan",
  "sop",
  "kebijakan",
  "aturan",
  "cuti",
  "reimbursement",
  "transportasi",
  "jam kerja",
  "hybrid",
  "laptop perusahaan",
  "peralatan kerja",
];

export type RouteDecision = {
  agent: AgentName;
  reason: string;
};

export function decideAgent(message: string): RouteDecision {
  const normalizedMessage = message.toLowerCase();

  const matchedKeyword = SPECIALIST_KEYWORDS.find((keyword) =>
    normalizedMessage.includes(keyword)
  );

  if (matchedKeyword) {
    return {
      agent: "specialist",
      reason: `Matched document-related keyword: ${matchedKeyword}`,
    };
  }

  return {
    agent: "manager",
    reason: "No document-related keyword was found",
  };
}