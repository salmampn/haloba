"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  BadgeCheck,
  BrainCircuit,
  Check,
  CircleAlert,
  Copy,
  Database,
  FileQuestion,
  UserRound,
} from "lucide-react";

type ChatMessageProps = {
  role: "user" | "assistant" | "error";
  content: string;
  answeredBy?: "manager" | "specialist";
  model?: string;
  totalTokens?: number;
  processingTimeMs?: number;
};

function formatProcessingTime(processingTimeMs?: number) {
  if (processingTimeMs === undefined || processingTimeMs === null) {
    return null;
  }

  if (processingTimeMs < 1000) {
    return `${processingTimeMs} ms`;
  }

  return `${(processingTimeMs / 1000).toFixed(1)}s`;
}

function getAnswerMetadata(
  answeredBy?: "manager" | "specialist",
  model?: string
) {
  const isNoDocumentMatch = model === "no-generation-needed";

  if (answeredBy === "manager") {
    return {
      label: "General response",
      icon: BrainCircuit,
    };
  }

  if (isNoDocumentMatch) {
    return {
      label: "No matching document found",
      icon: FileQuestion,
    };
  }

  return {
    label: "Document-grounded answer",
    icon: Database,
  };
}

export function ChatMessage({
  role,
  content,
  answeredBy,
  model,
  totalTokens,
  processingTimeMs,
}: ChatMessageProps) {
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  const isUser = role === "user";
  const isError = role === "error";
  const isSpecialist = answeredBy === "specialist";

  const isNoDocumentMatch =
    model === "no-generation-needed";

  const formattedProcessingTime = formatProcessingTime(
    processingTimeMs
  );

  const answerMetadata = getAnswerMetadata(answeredBy, model);
  const AnswerMetadataIcon = answerMetadata.icon;

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);

      setIsCopied(true);

      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setIsCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  }

  if (isError) {
    return (
      <article className="flex w-full gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-300/25 bg-rose-400/10 text-rose-200">
          <CircleAlert className="h-4 w-4" />
        </div>

        <div className="max-w-lg sm:max-w-xl">
          <div className="mb-2 text-xs font-semibold text-rose-100">
            Connection issue
          </div>

          <div className="rounded-2xl rounded-tl-md border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
            <p>{content}</p>
          </div>

          <p className="mt-2 text-xs text-rose-200/60">
            Your message remains in this conversation. You can try again when
            the connection is stable.
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group flex w-full gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
          isUser
            ? "border-sky-300/30 bg-sky-400/15 text-sky-200"
            : isNoDocumentMatch
              ? "border-amber-300/25 bg-amber-400/10 text-amber-200"
              : isSpecialist
                ? "border-indigo-300/25 bg-indigo-400/10 text-indigo-200"
                : "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
        }`}
      >
        {isUser ? (
          <UserRound className="h-4 w-4" />
        ) : isNoDocumentMatch ? (
          <FileQuestion className="h-4 w-4" />
        ) : isSpecialist ? (
          <Database className="h-4 w-4" />
        ) : (
          <BrainCircuit className="h-4 w-4" />
        )}
      </div>

      <div className={`max-w-lg sm:max-w-xl ${isUser ? "text-right" : ""}`}>
        <div
          className={`mb-2 flex items-center gap-2 text-xs ${
            isUser ? "justify-end" : ""
          }`}
        >
          <span className="font-semibold text-slate-100">
            {isUser ? "You" : "Assistant"}
          </span>

          {!isUser && answeredBy && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${
                isNoDocumentMatch
                  ? "border-amber-300/25 bg-amber-400/10 text-amber-200"
                  : isSpecialist
                    ? "border-indigo-300/25 bg-indigo-400/10 text-indigo-200"
                    : "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
              }`}
            >
              <BadgeCheck className="h-3 w-3" />
              {isNoDocumentMatch
                ? "No document match"
                : isSpecialist
                  ? "Specialist"
                  : "Manager"}
            </span>
          )}
        </div>

        <div
          className={`rounded-2xl px-4 py-3.5 text-left text-sm leading-6 shadow-sm ${
            isUser
              ? "rounded-tr-md border border-sky-300/20 bg-sky-400 text-[#07111f]"
              : isNoDocumentMatch
                ? "rounded-tl-md border border-amber-300/15 bg-amber-400/5 text-slate-100 backdrop-blur-sm"
                : "rounded-tl-md border border-slate-300/10 bg-white/5 text-slate-100 backdrop-blur-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-0">{children}</p>,

                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),

                em: ({ children }) => (
                  <em className="italic text-sky-100">{children}</em>
                ),

                ul: ({ children }) => (
                  <ul className="mb-0 list-disc space-y-1 pl-5">
                    {children}
                  </ul>
                ),

                ol: ({ children }) => (
                  <ol className="mb-0 list-decimal space-y-1 pl-5">
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
                  <pre className="aurora-scrollbar mb-0 overflow-x-auto rounded-xl border border-slate-300/10 bg-[#050d1a] p-3 text-xs leading-5 text-sky-100">
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
                  <blockquote className="mb-0 border-l-2 border-sky-300/50 pl-3 text-slate-300/75">
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
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300/55">
            <span>{totalTokens ?? 0} total tokens</span>

            {formattedProcessingTime && (
              <>
                <span className="h-1 w-1 rounded-full bg-slate-300/30" />
                <span>Processed in {formattedProcessingTime}</span>
              </>
            )}

            <span className="h-1 w-1 rounded-full bg-slate-300/30" />

            <span className="inline-flex items-center gap-1">
              <AnswerMetadataIcon className="h-3.5 w-3.5" />
              {answerMetadata.label}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="ml-1 inline-flex h-7 items-center gap-1 rounded-md px-2 text-slate-300/55 transition hover:bg-white/5 hover:text-slate-100"
              aria-label={isCopied ? "Message copied" : "Copy answer"}
              title={isCopied ? "Copied!" : "Copy answer"}
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-sky-300" />
                  <span className="font-medium text-sky-200">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}