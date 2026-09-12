"use client";

import { useCallback, useState } from "react";
import type {
  ChatApiResponse,
  ChatMessageItem,
} from "@/lib/types";

function createId() {
  return crypto.randomUUID();
}

function getFriendlyErrorMessage(error: unknown) {
  const rawMessage =
    error instanceof Error ? error.message : String(error);

  const message = rawMessage.toLowerCase();

  if (
    message.includes("gateway") ||
    message.includes("bad gateway") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("connect timeout") ||
    message.includes("connecttimeout")
  ) {
    return "Koneksi ke layanan AI sedang terganggu. Pesan Anda tidak dapat diproses saat ini. Silakan periksa koneksi internet atau coba lagi beberapa saat lagi.";
  }

  if (
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("resource exhausted") ||
    message.includes("rate limit") ||
    message.includes("quota")
  ) {
    return "Layanan AI sedang mencapai batas penggunaan. Tunggu sebentar, lalu coba kirim pertanyaan kembali.";
  }

  return "Terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi.";
}

export function useChat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (rawMessage: string) => {
      const message = rawMessage.trim();

      if (!message || isLoading) {
        return;
      }

      const userMessage: ChatMessageItem = {
        id: createId(),
        role: "user",
        content: message,
      };

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(conversationId ? { conversationId } : {}),
            message,
          }),
        });

        const data = (await response.json()) as ChatApiResponse;

        if (!response.ok) {
          throw new Error(
            data.error || "Gagal mendapatkan jawaban dari layanan chat."
          );
        }

        if (
          !data.conversationId ||
          !data.answer ||
          !data.answeredBy ||
          !data.usage
        ) {
          throw new Error("Respons chat dari server tidak lengkap.");
        }

        setConversationId(data.conversationId);

        const assistantMessage: ChatMessageItem = {
          id: createId(),
          role: "assistant",
          content: data.answer,
          answeredBy: data.answeredBy,
          model: data.model,
          usage: data.usage,
          processingTimeMs: data.processingTimeMs,
        };

        setMessages((currentMessages) => [
          ...currentMessages,
          assistantMessage,
        ]);
      } catch (error) {
        const errorMessage: ChatMessageItem = {
          id: createId(),
          role: "error",
          content: getFriendlyErrorMessage(error),
        };

        setMessages((currentMessages) => [
          ...currentMessages,
          errorMessage,
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, isLoading]
  );

  return {
    messages,
    input,
    isLoading,
    setInput,
    sendMessage,
  };
}