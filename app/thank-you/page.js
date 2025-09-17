"use client";

import dynamic from "next/dynamic";

const ThankYou = dynamic(() => import("../../src/ThankYou"), { ssr: false });

export default function ThankYouPage() {
  return <ThankYou />;
}
