import { ArrowUpRight } from "lucide-react";

type SuggestionChipProps = {
  label: string;
  onClick: () => void;
};

export function SuggestionChip({
  label,
  onClick,
}: SuggestionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-xl border border-slate-300/10 bg-white/4 px-3.5 py-2.5 text-left text-xs text-slate-200/70 transition hover:border-sky-300/30 hover:bg-sky-400/10 hover:text-sky-100"
    >
      <span>{label}</span>

      <ArrowUpRight className="size-3.5 text-slate-300/40 transition group-hover:text-sky-200" />
    </button>
  );
}