import { ArrowUp, LoaderCircle, Sparkles } from "lucide-react";
import type { FormEvent } from "react";

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
      className="border-t border-slate-300/10 bg-[#091a33]/80 px-4 py-4 backdrop-blur-xl sm:px-6"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-300/12 bg-white/[0.05] p-2 shadow-[0_12px_48px_rgba(0,0,0,0.2)] transition focus-within:border-sky-300/35 focus-within:bg-white/[0.075]">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Ask anything about the knowledge base..."
            rows={1}
            disabled={isLoading}
            className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-300/35 disabled:cursor-not-allowed"
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
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-400 text-[#07111f] transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-300/15 disabled:text-slate-300/35"
            aria-label="Send message"
            title="Send message"
          >
            {isLoading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-5 stroke-[2.5]" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-3 pb-1 pt-2 text-[11px] text-slate-300/40">
          <span>Enter to send · Shift + Enter for new line</span>

          <span className="hidden items-center gap-1.5 sm:flex">
            <Sparkles className="size-3 text-sky-300/80" />
            Token-efficient routing enabled
          </span>
        </div>
      </div>
    </form>
  );
}