"use client";

import { FormEvent, useState } from "react";
import { ChatMessage } from "@/components/chat-message";

type AgentName = "manager" | "specialist";

type TokenUsage = {
  routerInputTokens: number;
  routerOutputTokens: number;
  embeddingTokens: number;
  llmInputTokens: number;
  llmOutputTokens: number;
  thoughtTokens: number;
  totalTokens: number;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  answeredBy?: AgentName;
  usage?: TokenUsage;
};

type ChatApiResponse = {
  conversationId?: string;
  answer?: string;
  answeredBy?: AgentName;
  model?: string;
  usage?: TokenUsage;
  error?: string;
  details?: unknown;
};

const initialMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Halo! Saya dapat menjawab pertanyaan umum dan membantu mencari informasi dari dokumen knowledge base.",
  answeredBy: "manager",
  usage: {
    routerInputTokens: 0,
    routerOutputTokens: 0,
    embeddingTokens: 0,
    llmInputTokens: 0,
    llmOutputTokens: 0,
    thoughtTokens: 0,
    totalTokens: 0,
  },
};

export default function Home() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          message,
        }),
      });

      const data = (await response.json()) as ChatApiResponse;

      if (!response.ok) {
        console.error("Chat API validation error:", data);
        throw new Error(data.error || "Failed to get a response from the chat.");
      }

      setConversationId(data.conversationId!);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        answeredBy: data.answeredBy,
        usage: data.usage,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memproses pesan.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <header className="border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <p className="text-sm font-medium text-blue-100">
            Next.js · Supabase · Gemini
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            Multi-Agent Knowledge Chat
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
            Pertanyaan umum dijawab cepat. Pertanyaan terkait dokumen akan
            diperiksa melalui knowledge base.
          </p>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 px-4 py-6 sm:px-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              answeredBy={message.answeredBy}
              totalTokens={message.usage?.totalTokens}
            />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                <p className="font-medium text-slate-700">
                  Assistant sedang menyiapkan jawaban...
                </p>
                <p className="mt-1 text-xs">
                  Manager sedang menentukan sumber jawaban yang sesuai.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-200 bg-white p-4 sm:p-5"
        >
          <label htmlFor="chat-input" className="sr-only">
            Tulis pertanyaan
          </label>

          <div className="flex items-end gap-3">
            <textarea
              id="chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tulis pertanyaan, misalnya: Berapa hari cuti tahunan?"
              rows={2}
              disabled={isLoading}
              className="min-h-12 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isLoading ? "Memproses..." : "Kirim"}
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Contoh: “Apa itu Next.js?”, “Berapa hari cuti tahunan?”, atau
            “Berapa batas reimbursement transportasi?”
          </p>
        </form>
      </section>
    </main>
  );
}