'use client';

import { ToastContainer } from 'react-toastify';
import { useTheme } from '@/providers/ThemeProvider';

export default function ThemeAwareToastContainer() {
  const { theme } = useTheme();

  return (
    <ToastContainer 
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === 'dark' ? 'dark' : 'light'}
      className="custom-toast-container"
      style={{
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
      }}
    />
  );
}