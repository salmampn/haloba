import { ArrowUp, LoaderCircle, Sparkles } from "lucide-react";
import type { FormEvent } from "react";
import { CHAT_PLACEHOLDER } from "@/lib/constants";

type ChatComposerProps = {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChatComposer({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatComposerProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="shrink-0 border-t border-slate-300/10 bg-[#091a33]/95 px-4 py-4 backdrop-blur-xl sm:px-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-sky-300/15 bg-[#0c1d38] p-2 shadow-[0_12px_48px_rgba(0,0,0,0.24)] transition duration-200 focus-within:border-sky-300/50 focus-within:bg-[#102544] focus-within:ring-4 focus-within:ring-sky-400/10">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={CHAT_PLACEHOLDER}
            rows={1}
            disabled={isLoading}
            className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-slate-100 caret-sky-300 outline-none placeholder:text-slate-400/55 disabled:cursor-not-allowed disabled:opacity-60"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-400 text-[#07111f] transition duration-200 hover:bg-sky-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.28)] focus:outline-none focus:ring-4 focus:ring-sky-400/25 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:hover:shadow-none"
            aria-label="Send message"
            title="Send message"
          >
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5 stroke-[2.5]" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-3 pb-1 pt-2 text-xs text-slate-400/70">
          <span>Enter to send · Shift + Enter for new line</span>

          <span className="hidden items-center gap-1.5 sm:flex">
            <Sparkles className="h-3 w-3 text-sky-300/80" />
            Token-efficient routing enabled
          </span>
        </div>
      </div>
    </form>
  );
}