"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

const BrandingBadge = () => {
  const pathname = usePathname();

  if (!pathname || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-[1000]">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 shadow-xl shadow-black/20 backdrop-blur">
        <Image
          src="/branding/craiedl_logo.png"
          alt="Craiedl logo"
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
          priority
        />
        <span className="text-lg font-semibold tracking-wide text-slate-800">
          MoralMaps
        </span>
      </div>
    </div>
  );
};

export default BrandingBadge;
