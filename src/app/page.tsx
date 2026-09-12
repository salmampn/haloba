"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Activity, Menu, Sparkles, X } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatComposer } from "@/components/chat-composer";
import { ChatMessage } from "@/components/chat-message";
import { EmptyChatState } from "@/components/empty-chat-state";

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
};

export default function Home() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim();

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
          ...(conversationId ? { conversationId } : {}),
          message,
        }),
      });

      const data = (await response.json()) as ChatApiResponse;

      if (!response.ok) {
        console.error("Chat API error:", data);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleSuggestionClick(suggestion: string) {
    void sendMessage(suggestion);
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#07111f] text-slate-100">
      <div className="relative flex h-full min-h-0">
        <AppSidebar />

        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden">
            <div className="absolute inset-y-0 left-0 h-full w-72 border-r border-slate-300/10 bg-[#0a1930]">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-slate-300/60 transition hover:bg-white/10 hover:text-slate-100"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>

              <AppSidebar />
            </div>
          </div>
        )}

        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-18 shrink-0 items-center justify-between border-b border-slate-300/10 bg-[#091a33]/75 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="flex size-10 items-center justify-center rounded-xl border border-slate-300/10 bg-white/4 text-slate-200/70 transition hover:bg-white/8 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>

              <div className="flex size-10 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-400/10 text-sky-200 lg:hidden">
                <Sparkles className="size-5" />
              </div>

              <div>
                <p className="text-sm font-semibold tracking-tight text-slate-100">
                  Multi-Agent Knowledge Chat
                </p>
                <p className="mt-0.5 text-xs text-slate-300/50">
                  Manager routing · Specialist retrieval
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-300/10 bg-white/4 px-3 py-1.5 text-xs text-slate-300/60">
              <Activity className="size-3.5 text-sky-300" />
              <span className="hidden sm:inline">System status:</span>
              <span className="font-medium text-slate-100">Online</span>
            </div>
          </header>

          <div className="aurora-scrollbar relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
              {messages.length === 0 ? (
                <EmptyChatState onSuggestionClick={handleSuggestionClick} />
              ) : (
                <div className="space-y-7 py-2">
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
                    <div className="flex gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                        <Sparkles className="size-4 animate-pulse" />
                      </div>

                      <div>
                        <div className="mb-2 text-xs font-semibold text-slate-100">
                          Assistant
                        </div>

                        <div className="rounded-2xl rounded-tl-md border border-slate-300/10 bg-white/5.5 px-4 py-3 text-sm text-slate-200/65">
                          <div className="flex items-center gap-2">
                            <span className="flex gap-1">
                              <span className="size-1.5 animate-bounce rounded-full bg-sky-300 [animation-delay:-0.3s]" />
                              <span className="size-1.5 animate-bounce rounded-full bg-sky-300 [animation-delay:-0.15s]" />
                              <span className="size-1.5 animate-bounce rounded-full bg-sky-300" />
                            </span>

                            Routing your question to the best agent...
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
                      <span className="font-semibold">Unable to respond. </span>
                      {errorMessage}
                    </div>
                  )}

                  <div ref={scrollAnchorRef} />
                </div>
              )}
            </div>
          </div>

          <ChatComposer
            input={input}
            isLoading={isLoading}
            onInputChange={setInput}
            onSubmit={handleSubmit}
          />
        </section>
      </div>
    </main>
  );
}