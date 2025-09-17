"use client";

import dynamic from "next/dynamic";

const MapRoute = dynamic(() => import("../src/MapRoute"), { ssr: false });

export default function Page() {
  return <MapRoute />;
}
