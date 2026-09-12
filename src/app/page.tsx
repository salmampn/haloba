"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatComposer } from "@/components/chat-composer";
import { ChatPanel } from "@/components/chat-panel";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { useChat } from "@/hooks/use-chat";

export default function Home() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    messages,
    input,
    isLoading,
    setInput,
    sendMessage,
  } = useChat();

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

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

        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AppHeader onOpenMenu={() => setIsMobileSidebarOpen(true)} />

          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            scrollAnchorRef={scrollAnchorRef}
            onSuggestionClick={handleSuggestionClick}
          />

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