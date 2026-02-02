import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "CareerForge | Smart Domain & Portfolio Analyzer",
  description: "AI-powered career guidance for engineering students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${outfit.variable} antialiased selection:bg-[#FF2E63] selection:text-white flex flex-col min-h-screen`}>
        <AuthProvider>
          <Navbar />
          <div className="flex-grow pt-20">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
