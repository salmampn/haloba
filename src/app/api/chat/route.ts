import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decideAgent } from "@/lib/agents/router";
import { answerWithManager } from "@/lib/agents/manager";
import { answerWithSpecialist } from "@/lib/agents/specialist";

export const runtime = "nodejs";

const chatRequestSchema = z.object({
  conversationId: z.string().uuid().nullish(),
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message is too long."),
});

type ErrorCategory =
  | "network"
  | "rate_limit"
  | "validation"
  | "internal";

type SafeError = {
  message: string;
  status: number;
  category: ErrorCategory;
};

function getSafeErrorMessage(error: unknown): SafeError {
  const rawError =
    error instanceof Error ? error.message : JSON.stringify(error);

  const normalizedError = rawError.toLowerCase();

  const isRateLimited =
    normalizedError.includes("429") ||
    normalizedError.includes("resource_exhausted") ||
    normalizedError.includes("resource exhausted") ||
    normalizedError.includes("quota") ||
    normalizedError.includes("rate limit");

  if (isRateLimited) {
    return {
      message:
        "Layanan AI sedang mencapai batas penggunaan. Tunggu sebentar, lalu coba kirim pesan lagi.",
      status: 429,
      category: "rate_limit",
    };
  }

  const isNetworkError =
    normalizedError.includes("fetch failed") ||
    normalizedError.includes("connecttimeout") ||
    normalizedError.includes("connect timeout") ||
    normalizedError.includes("network") ||
    normalizedError.includes("gateway") ||
    normalizedError.includes("bad gateway") ||
    normalizedError.includes("502") ||
    normalizedError.includes("503") ||
    normalizedError.includes("504");

  if (isNetworkError) {
    return {
      message:
        "Koneksi ke layanan AI sedang terganggu. Pesan Anda belum dapat diproses. Silakan coba lagi beberapa saat lagi.",
      status: 503,
      category: "network",
    };
  }

  return {
    message:
      "Terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi.",
    status: 500,
    category: "internal",
  };
}

async function saveErrorMessage(
  conversationId: string | undefined,
  safeError: SafeError
) {
  if (!conversationId) {
    return;
  }

  const { error } = await supabaseAdmin.from("messages").insert({
    conversation_id: conversationId,
    role: "error",
    content: safeError.message,

    error_code: safeError.status,
    error_category: safeError.category,

    router_input_tokens: 0,
    router_output_tokens: 0,
    embedding_tokens: 0,
    llm_input_tokens: 0,
    llm_output_tokens: 0,
    thought_tokens: 0,
    total_tokens: 0,
  });

  if (error) {
    console.error("Failed to save error message:", error.message);
  }
}

export async function POST(request: Request) {
  let conversationId: string | undefined;

  try {
    let requestBody: unknown;

    try {
      requestBody = await request.json();
    } catch {
      return Response.json(
        {
          error: "Request body harus berupa JSON yang valid.",
        },
        {
          status: 400,
        }
      );
    }

    const parsedRequest = chatRequestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      console.error(
        "Invalid chat request:",
        requestBody,
        parsedRequest.error.issues
      );

      return Response.json(
        {
          error: "Invalid request data.",
          details: parsedRequest.error.issues,
        },
        {
          status: 400,
        }
      );
    }

    const {
      conversationId: rawConversationId,
      message,
    } = parsedRequest.data;

    conversationId = rawConversationId ?? undefined;

    if (!conversationId) {
      const { data: conversation, error: conversationError } =
        await supabaseAdmin
          .from("conversations")
          .insert({})
          .select("id")
          .single();

      if (conversationError || !conversation) {
        throw new Error(
          `Failed to create conversation: ${
            conversationError?.message ?? "Unknown error"
          }`
        );
      }

      conversationId = conversation.id;
    }

    const { error: userMessageError } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "user",
        content: message,

        router_input_tokens: 0,
        router_output_tokens: 0,
        embedding_tokens: 0,
        llm_input_tokens: 0,
        llm_output_tokens: 0,
        thought_tokens: 0,
        total_tokens: 0,
      });

    if (userMessageError) {
      throw new Error(
        `Failed to save user message: ${userMessageError.message}`
      );
    }

    const routeDecision = decideAgent(message);

    const agentStartedAt = performance.now();

    const agentResult =
      routeDecision.agent === "manager"
        ? await answerWithManager(message)
        : await answerWithSpecialist(message);

    const processingTimeMs = Math.round(
      performance.now() - agentStartedAt
    );

    const { error: assistantMessageError } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: agentResult.answer,

        answered_by: agentResult.answeredBy,
        model: agentResult.model,

        router_input_tokens: agentResult.usage.routerInputTokens,
        router_output_tokens: agentResult.usage.routerOutputTokens,
        embedding_tokens: agentResult.usage.embeddingTokens,
        llm_input_tokens: agentResult.usage.llmInputTokens,
        llm_output_tokens: agentResult.usage.llmOutputTokens,
        thought_tokens: agentResult.usage.thoughtTokens,
        total_tokens: agentResult.usage.totalTokens,

        processing_time_ms: processingTimeMs,
      });

    if (assistantMessageError) {
      throw new Error(
        `Failed to save assistant message: ${assistantMessageError.message}`
      );
    }

    return Response.json(
      {
        conversationId,
        answer: agentResult.answer,
        answeredBy: agentResult.answeredBy,
        model: agentResult.model,
        usage: agentResult.usage,
        processingTimeMs,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Chat API error:", error);

    const safeError = getSafeErrorMessage(error);

    await saveErrorMessage(conversationId, safeError);

    return Response.json(
      {
        conversationId,
        error: safeError.message,
        errorCode: safeError.status,
        errorCategory: safeError.category,
      },
      {
        status: safeError.status,
      }
    );
  }
}