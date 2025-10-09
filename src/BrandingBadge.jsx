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
      <div className="pointer-events-auto flex w-44 flex-col items-center gap-3 rounded-2xl border border-white/50 bg-gradient-to-br from-white/80 via-white/60 to-white/80 px-5 py-4 text-center shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <Image
          src="/branding/craiedl_logo.png"
          alt="Craiedl logo"
          width={176}
          height={56}
          className="h-auto w-full object-contain drop-shadow-sm"
          priority
        />
        <span className="w-full text-xl font-semibold tracking-tight text-slate-800">
          MoralMaps
        </span>
      </div>
    </div>
  );
};

export default BrandingBadge;
