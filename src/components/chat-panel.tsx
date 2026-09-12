import type { RefObject } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatLoading } from "@/components/chat-status";
import { EmptyChatState } from "@/components/empty-chat-state";
import type { ChatMessageItem } from "@/lib/types";

type ChatPanelProps = {
  messages: ChatMessageItem[];
  isLoading: boolean;
  scrollAnchorRef: RefObject<HTMLDivElement | null>;
  onSuggestionClick: (suggestion: string) => void;
};

export function ChatPanel({
  messages,
  isLoading,
  scrollAnchorRef,
  onSuggestionClick,
}: ChatPanelProps) {
  return (
    <div className="aurora-scrollbar relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {messages.length === 0 ? (
          <EmptyChatState onSuggestionClick={onSuggestionClick} />
        ) : (
          <div className="py-2">
            {messages.map((message, index) => {
              const previousMessage = messages[index - 1];

              const isReplyToUser =
                previousMessage?.role === "user" &&
                (message.role === "assistant" || message.role === "error");

              const startsNewTurn =
                (previousMessage?.role === "assistant" ||
                  previousMessage?.role === "error") &&
                message.role === "user";

              const spacingClass =
                index === 0
                  ? ""
                  : isReplyToUser
                    ? "mt-4"
                    : startsNewTurn
                      ? "mt-7"
                      : "mt-3";

              return (
                <div key={message.id} className={spacingClass}>
                  <ChatMessage
                    role={message.role}
                    content={message.content}
                    answeredBy={message.answeredBy}
                    model={message.model}
                    totalTokens={message.usage?.totalTokens}
                    processingTimeMs={message.processingTimeMs}
                  />
                </div>
              );
            })}

            {isLoading && (
              <div className="mt-4">
                <ChatLoading />
              </div>
            )}

            <div ref={scrollAnchorRef} />
          </div>
        )}
      </div>
    </div>
  );
}