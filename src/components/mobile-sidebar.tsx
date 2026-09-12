import { X } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileSidebar({
  isOpen,
  onClose,
}: MobileSidebarProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden">
      <div className="absolute inset-y-0 left-0 h-full w-72 border-r border-slate-300/10 bg-[#0a1930]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-slate-300/60 transition hover:bg-white/10 hover:text-slate-100"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        <AppSidebar isMobile className="flex h-full w-full border-0" />
      </div>
    </div>
  );
}