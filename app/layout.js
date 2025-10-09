import "../src/index.css";
import BrandingBadge from "../src/BrandingBadge";

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
