import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrepStudio — AI Learning Studio",
  description: "Build custom day-by-day curricula, generate deep technical readings, practice with a voice AI interviewer, and refine your notes into professional blogs.",
  icons: {
    icon: "/logo.svg"
  }
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
