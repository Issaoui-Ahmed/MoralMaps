"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

const BrandingBadge = () => {
  const pathname = usePathname();

  if (!pathname || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-6 right-6 z-[1000]">
      <div className="pointer-events-auto flex items-center gap-4 rounded-2xl border border-white/50 bg-gradient-to-br from-white/80 via-white/60 to-white/80 px-5 py-3 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <Image
          src="/branding/craiedl_logo.png"
          alt="Craiedl logo"
          width={56}
          height={56}
          className="h-14 w-14 object-contain drop-shadow-sm"
          priority
        />
        <div className="flex flex-col text-right">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Powered by
          </span>
          <span className="text-xl font-semibold tracking-tight text-slate-800">
            MoralMaps
          </span>
        </div>
      </div>
    </div>
  );
};

export default BrandingBadge;
