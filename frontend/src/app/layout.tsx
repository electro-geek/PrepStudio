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
    <html lang="en" className="dark">
      <body className="bg-[#0F172A] text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
