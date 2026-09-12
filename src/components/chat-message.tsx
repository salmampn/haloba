import ReactMarkdown from "react-markdown";
import {
  BadgeCheck,
  BrainCircuit,
  Copy,
  Database,
  UserRound,
} from "lucide-react";

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
  const isSpecialist = answeredBy === "specialist";

  async function copyAnswer() {
    if (!isUser) {
      await navigator.clipboard.writeText(content);
    }
  }

  return (
    <article
      className={`group flex w-full gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${
          isUser
            ? "border-sky-300/30 bg-sky-400/15 text-sky-200"
            : isSpecialist
              ? "border-indigo-300/25 bg-indigo-400/10 text-indigo-200"
              : "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
        }`}
      >
        {isUser ? (
          <UserRound className="size-4" />
        ) : isSpecialist ? (
          <Database className="size-4" />
        ) : (
          <BrainCircuit className="size-4" />
        )}
      </div>

      <div
        className={`max-w-[88%] sm:max-w-[78%] ${
          isUser ? "text-right" : ""
        }`}
      >
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-100">
            {isUser ? "You" : "Assistant"}
          </span>

          {!isUser && answeredBy && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${
                isSpecialist
                  ? "border-indigo-300/25 bg-indigo-400/10 text-indigo-200"
                  : "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
              }`}
            >
              <BadgeCheck className="size-3" />
              {isSpecialist ? "Specialist" : "Manager"}
            </span>
          )}
        </div>

        <div
          className={`rounded-2xl px-4 py-3.5 text-left text-sm leading-6 shadow-sm ${
            isUser
              ? "rounded-tr-md border border-sky-300/20 bg-sky-400 text-[#07111f]"
              : "rounded-tl-md border border-slate-300/10 bg-white/5.5 text-slate-100 backdrop-blur-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0">{children}</p>
                ),

                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),

                em: ({ children }) => (
                  <em className="italic text-sky-100">{children}</em>
                ),

                ul: ({ children }) => (
                  <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">
                    {children}
                  </ul>
                ),

                ol: ({ children }) => (
                  <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">
                    {children}
                  </ol>
                ),

                li: ({ children }) => <li>{children}</li>,

                code: ({ children }) => (
                  <code className="rounded-md border border-sky-300/15 bg-sky-400/10 px-1.5 py-0.5 font-mono text-[0.82em] text-sky-200">
                    {children}
                  </code>
                ),

                pre: ({ children }) => (
                  <pre className="aurora-scrollbar mb-3 overflow-x-auto rounded-xl border border-slate-300/10 bg-[#050d1a] p-3 text-xs leading-5 text-sky-100 last:mb-0">
                    {children}
                  </pre>
                ),

                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-300 underline decoration-sky-300/40 underline-offset-4 transition hover:text-sky-200"
                  >
                    {children}
                  </a>
                ),

                blockquote: ({ children }) => (
                  <blockquote className="mb-3 border-l-2 border-sky-300/50 pl-3 text-slate-300/75 last:mb-0">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>

        {!isUser && answeredBy && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-300/55">
            <span>{totalTokens ?? 0} total tokens</span>

            <span className="size-1 rounded-full bg-slate-300/30" />

            <span>
              {isSpecialist
                ? "Document-grounded answer"
                : "General response"}
            </span>

            <button
              type="button"
              onClick={copyAnswer}
              className="ml-1 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-slate-300/55 transition hover:bg-white/5 hover:text-slate-100"
              aria-label="Copy answer"
              title="Copy answer"
            >
              <Copy className="size-3" />
              Copy
            </button>
          </div>
        )}
      </div>
    </article>
  );
}