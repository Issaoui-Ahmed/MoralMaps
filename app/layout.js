import "../src/index.css";
import BrandingBadge from "../src/BrandingBadge";

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
        <BrandingBadge />
      </body>
    </html>
  );
}
