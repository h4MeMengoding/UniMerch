import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import ThemeAwareToastContainer from "@/components/ui/ThemeAwareToastContainer";
import 'react-toastify/dist/ReactToastify.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "UniMerch - Platform E-commerce Merchandise Universitas Terpercaya",
  description: "Temukan koleksi merchandise kampus terlengkap dengan kualitas terbaik dan harga terjangkau. Belanja jaket, kaos, tas, dan souvenir universitas dengan mudah.",
  keywords: "merchandise kampus, jaket kampus, kaos polo kampus, tas kampus, souvenir universitas, merchandise universitas",
  authors: [{ name: "UniMerch Team" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${plusJakartaSans.className} antialiased bg-white dark:bg-dark-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <ConditionalFooter />
            </div>
            <ThemeAwareToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
