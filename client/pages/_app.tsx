import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'dark:bg-neutral-800 dark:text-neutral-50 dark:border-neutral-700',
          style: {
            background: '#fff',
            color: '#1a1a1a',
            border: '1px solid #e7e5e4',
            borderRadius: '0.75rem',
            padding: '16px',
            fontSize: '14px',
            fontFamily: 'Inter, ui-sans-serif, system-ui',
          },
          success: {
            iconTheme: {
              primary: '#f97316', // orange-600
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ThemeProvider>
  )
}