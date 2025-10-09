import Image from "next/image";

import "../src/index.css";

export const metadata = {
  icons: {
    icon: [
      {
        url: "/branding/craiedl_favicon.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    apple: [
      {
        url: "/branding/craiedl_webclip.png",
        sizes: "180x180",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        <div className="pointer-events-none fixed right-6 top-6 z-[1000]">
          <Image
            src="/branding/craiedl_favicon.png"
            alt="Craiedl icon"
            width={48}
            height={48}
            className="pointer-events-auto h-12 w-12 object-contain drop-shadow-sm"
            priority
          />
        </div>
      </body>
    </html>
  );
}
