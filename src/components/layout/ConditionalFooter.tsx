'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on admin pages and user dashboard
  if (pathname.startsWith('/admin') || pathname.startsWith('/user/dashboard')) {
    return null;
  }
  
  return <Footer />;
}