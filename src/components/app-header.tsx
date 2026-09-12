import { Activity, Menu, Sparkles } from "lucide-react";
import { APP_NAME, APP_SUBTITLE } from "@/lib/constants";

type AppHeaderProps = {
  onOpenMenu: () => void;
};

export function AppHeader({ onOpenMenu }: AppHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-300/10 bg-[#091a33]/75 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/10 bg-white/4 text-slate-200/70 transition hover:bg-white/8 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-400/10 text-sky-200 lg:hidden">
          <Sparkles className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-100">
            {APP_NAME}
          </p>

          <p className="mt-0.5 text-xs text-slate-300/50">{APP_SUBTITLE}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-slate-300/10 bg-white/4 px-3 py-1.5 text-xs text-slate-300/60">
        <Activity className="h-3.5 w-3.5 text-sky-300" />
        <span className="hidden sm:inline">System status:</span>
        <span className="font-medium text-slate-100">Online</span>
      </div>
    </header>
  );
}