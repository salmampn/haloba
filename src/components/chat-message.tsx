type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  answeredBy?: "manager" | "specialist";
  totalTokens?: number;
};

export function ChatMessage({
  role,
  content,
  answeredBy,
  totalTokens,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
        }`}
      >
        <p className="mb-1 text-xs font-semibold opacity-70">
          {isUser ? "Kamu" : "Assistant"}
        </p>

        <p className="whitespace-pre-wrap text-sm leading-6">{content}</p>

        {!isUser && answeredBy && (
          <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1 font-medium capitalize">
              {answeredBy}
            </span>

            <span>
              {totalTokens ?? 0} token
              {(totalTokens ?? 0) !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}