import { Compass, Sparkles } from "lucide-react";
import { SuggestionChip } from "@/components/suggestion-chip";
import { CHAT_SUGGESTIONS } from "@/lib/constants";

type EmptyChatStateProps = {
  onSuggestionClick: (suggestion: string) => void;
};

export function EmptyChatState({
  onSuggestionClick,
}: EmptyChatStateProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-10 text-center sm:py-16">
      <div className="relative">
        <div className="absolute -inset-8 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative flex size-16 items-center justify-center rounded-3xl border border-sky-300/25 bg-sky-400/10 text-sky-200 shadow-[0_0_42px_rgba(56,189,248,0.14)]">
          <Sparkles className="size-7" />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-bold tracking-[0.22em] text-sky-200/75">
          KNOWLEDGE CONTROL ROOM
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
          What would you like to know?
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300/55">
          Ajukan pertanyaan umum untuk respons cepat, atau tanyakan kebijakan
          internal agar Specialist mencari jawaban dari knowledge base.
        </p>
      </div>

      <div className="mt-8 flex max-w-xl flex-wrap justify-center gap-2">
        {CHAT_SUGGESTIONS.map((suggestion) => (
          <SuggestionChip
            key={suggestion}
            label={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
          />
        ))}
      </div>

      <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-slate-300/10 bg-white/4 px-3 py-2 text-xs text-slate-300/55">
        <Compass className="size-3.5 text-cyan-200" />
        One chat interface · Two agents working silently
      </div>
    </div>
  );
}