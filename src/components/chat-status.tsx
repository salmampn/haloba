import { Sparkles } from "lucide-react";

export function ChatLoading() {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
        <Sparkles className="h-4 w-4 animate-pulse" />
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold text-slate-100">
          Assistant
        </div>

        <div className="rounded-2xl rounded-tl-md border border-slate-300/10 bg-white/5 px-4 py-3 text-sm text-slate-200/65">
          <div className="flex items-center gap-2">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-300 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-300 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-300" />
            </span>

            Routing your question to the best agent...
          </div>
        </div>
      </div>
    </div>
  );
}