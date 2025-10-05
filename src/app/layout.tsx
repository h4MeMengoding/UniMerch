import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body className={`${inter.variable} font-sans antialiased bg-white dark:bg-dark-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <ConditionalFooter />
            </div>
            <ToastContainer 
              position="bottom-right"
              autoClose={6000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="auto"
              style={{
                bottom: '100px',
                right: '20px',
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
