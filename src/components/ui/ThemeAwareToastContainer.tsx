'use client';

import { ToastContainer } from 'react-toastify';
import { useTheme } from '@/providers/ThemeProvider';

export default function ThemeAwareToastContainer() {
  const { theme } = useTheme();

  return (
    <ToastContainer 
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === 'dark' ? 'dark' : 'light'}
      className="custom-toast-container"
      limit={3}
      style={{
        top: '80px',
        right: '20px',
        zIndex: 9999,
      }}
    />
  );
}