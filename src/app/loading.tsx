import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
          </div>
        </div>
        <p className="text-xl font-black text-primary tracking-tighter animate-pulse">
          StayFloow<span className="text-secondary">.com</span>
        </p>
      </div>
    </div>
  );
}
