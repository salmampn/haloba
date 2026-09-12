import {
  BookOpenText,
  Bot,
  CheckCircle2,
  Database,
  Sparkles,
} from "lucide-react";

export function AppSidebar() {
  return (
    <aside className="aurora-scrollbar hidden h-full w-72 shrink-0 flex-col overflow-y-auto border-r border-slate-300/10 bg-[#0a1930]/75 p-5 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-3 px-2">
        <div className="flex size-10 items-center justify-center rounded-2xl border border-sky-300/25 bg-sky-400/10 text-sky-200 shadow-[0_0_28px_rgba(56,189,248,0.18)]">
          <Sparkles className="size-5" />
        </div>

        <div>
          <p className="text-sm font-semibold tracking-wide text-slate-100">
            SYNAPSE
          </p>
          <p className="text-xs text-slate-300/55">Knowledge workspace</p>
        </div>
      </div>

      <div className="mt-10">
        <p className="px-2 text-[10px] font-bold tracking-[0.18em] text-slate-300/45">
          AGENT SYSTEM
        </p>

        <div className="mt-3 space-y-3">
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/7 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-200">
                <Bot className="size-4" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Manager
                </p>
                <p className="text-xs text-slate-300/55">General Q&amp;A</p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-200/60">
              Menangani pertanyaan umum secara cepat dan efisien.
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-300/20 bg-indigo-400/8 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-400/15 text-indigo-200">
                <BookOpenText className="size-4" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Specialist
                </p>
                <p className="text-xs text-slate-300/55">Document RAG</p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-200/60">
              Memeriksa knowledge base sebelum menjawab informasi kebijakan.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="px-2 text-[10px] font-bold tracking-[0.18em] text-slate-300/45">
          KNOWLEDGE BASE
        </p>

        <div className="mt-3 rounded-2xl border border-slate-300/10 bg-white/4 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-sky-200">
              <Database className="size-4" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-100">
                Employee Handbook
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-300/55">
                Cuti, reimbursement, jam kerja, dan peralatan kerja.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-200/70">
            <CheckCircle2 className="size-3.5 text-sky-300" />
            4 document chunks indexed
          </div>
        </div>
      </div>

      <div className="mt-auto rounded-2xl border border-slate-300/10 bg-white/4 p-4">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-300 opacity-70" />
            <span className="relative inline-flex size-2.5 rounded-full bg-sky-300" />
          </span>

          <p className="text-xs font-medium text-slate-200">System online</p>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-300/50">
          Manager dan Specialist siap memproses pertanyaan.
        </p>
      </div>
    </aside>
  );
}