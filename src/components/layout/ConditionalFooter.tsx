'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on admin pages, user dashboard, and payment pages
  if (pathname.startsWith('/admin') || 
      pathname.startsWith('/user/dashboard') || 
      pathname.startsWith('/payment/')) {
    return null;
  }
  
  return <Footer />;
}