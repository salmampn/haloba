import {
  BookOpenText,
  Bot,
  CheckCircle2,
  Database,
} from "lucide-react";
import Image from "next/image";

type AppSidebarProps = {
  className?: string;
  isMobile?: boolean;
};

export function AppSidebar({
  className = "",
  isMobile = false,
}: AppSidebarProps) {
  const visibilityClass = isMobile ? "flex" : "hidden lg:flex";

  return (
    <aside
      className={`aurora-scrollbar h-full w-72 shrink-0 flex-col overflow-y-auto border-r border-slate-300/10 bg-[#0a1930]/75 p-5 backdrop-blur-xl ${visibilityClass} ${className}`}
    >
      <div className="flex items-center gap-3 px-2">
        <div className="relative flex size-12 shrink-0 items-center justify-center overflow-visible">
          <Image
            src="/logo.png"
            alt="HALOBA logo"
            fill
            priority
            sizes="48px"
            className="object-contain drop-shadow-[0_0_6px_rgba(56,189,248,0.95)]"
          />

          <span className="pointer-events-none absolute -inset-2 -z-10 rounded-full bg-cyan-400/20 blur-xl" />
          <span className="pointer-events-none absolute -inset-4 -z-10 rounded-full bg-indigo-500/15 blur-2xl" />
        </div>

        <div>
          <p className="text-sm font-semibold tracking-wide text-slate-100">
            HALOBA
          </p>

          <p className="text-xs text-slate-300/55">
            Internal Knowledge Assistant
          </p>
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

                <p className="text-xs text-slate-300/55">
                  General Q&amp;A
                </p>
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

                <p className="text-xs text-slate-300/55">
                  Document RAG
                </p>
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
                Cuti, reimbursement, jam kerja, benefit, keamanan data, dan
                onboarding.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-200/70">
            <CheckCircle2 className="size-3.5 text-sky-300" />
            Employee handbook indexed
          </div>
        </div>
      </div>

      <div className="mt-auto rounded-2xl border border-slate-300/10 bg-white/4 p-4">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-300 opacity-70" />
            <span className="relative inline-flex size-2.5 rounded-full bg-sky-300" />
          </span>

          <p className="text-xs font-medium text-slate-200">
            System online
          </p>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-300/50">
          Manager dan Specialist siap memproses pertanyaan.
        </p>
      </div>
    </aside>
  );
}