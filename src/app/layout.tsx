import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import ThemeAwareToastContainer from "@/components/ui/ThemeAwareToastContainer";
import 'react-toastify/dist/ReactToastify.css';
import PWARegister from '@/components/PWARegister';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

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
  icons: {
    icon: [
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon.ico' }
    ],
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png'
  }
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
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="UniMerch" />
      </head>
      <body 
        className={`${plusJakartaSans.className} antialiased bg-white dark:bg-dark-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <ConditionalFooter />
              <MobileBottomNav />
            </div>
            <ThemeAwareToastContainer />
              {/* PWA service worker registration (client) */}
              <PWARegister />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
