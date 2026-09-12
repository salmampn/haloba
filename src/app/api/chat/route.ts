import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decideAgent } from "@/lib/agents/router";
import { answerWithManager } from "@/lib/agents/manager";
import { answerWithSpecialist } from "@/lib/agents/specialist";

export const runtime = "nodejs";

const chatRequestSchema = z.object({
  conversationId: z.string().uuid().nullish(),
  message: z.string().trim().min(1, "Message cannot be empty.").max(2000),
});

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          error: "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    const parsedBody = chatRequestSchema.safeParse(body);

    if (!parsedBody.success) {
        console.error(
            "Invalid chat request body:",
            body,
            parsedBody.error.issues
        );

        return Response.json(
            {
            error: "Invalid request data.",
            details: parsedBody.error.issues,
            },
            {
            status: 400,
            }
        );
    }

    const { conversationId: rawConversationId, message } = parsedBody.data;

    let conversationId = rawConversationId ?? undefined;

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

        answered_by: null,
        model: null,

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

    const agentResult =
      routeDecision.agent === "manager"
        ? await answerWithManager(message)
        : await answerWithSpecialist(message);

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
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      {
        status: 500,
      }
    );
  }
}