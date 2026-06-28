import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://prepstudio.mritunjay.live";

export const metadata: Metadata = {
  title: "PrepStudio",
  description: "Build custom day-by-day curricula, generate deep technical readings, practice with a voice AI interviewer, and refine your notes into professional blogs.",
  icons: {
    icon: "/logo.svg",
  },
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "PrepStudio",
    description: "Build custom day-by-day curricula, generate deep technical readings, practice with a voice AI interviewer, and refine your notes into professional blogs.",
    url: BASE_URL,
    siteName: "PrepStudio",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "PrepStudio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepStudio",
    description: "Build custom day-by-day curricula, generate deep technical readings, practice with a voice AI interviewer, and refine your notes into professional blogs.",
    images: ["/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-neo-brutalist" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {/* No-flash theme init — runs before first paint.
            Stored value is one of the .theme-* class names; defaults to graphite-lab. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var THEMES=['theme-paper-lab','theme-graphite-lab','theme-sage-board','theme-high-contrast','theme-paper-brutalist','theme-neo-brutalist'];var t=localStorage.getItem('ps-theme');if(!THEMES.includes(t))t='theme-neo-brutalist';var d=document.documentElement;THEMES.forEach(function(c){d.classList.remove(c);});d.classList.add(t);}catch(e){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
