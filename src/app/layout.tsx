import type { Metadata } from 'next'
  import { Inter } from 'next/font/google'
  import './globals.css'
  import { Providers } from './providers'
  import '@rainbow-me/rainbowkit/styles.css'

  const inter = Inter({ subsets: ['latin'] })

  export const metadata: Metadata = {
    title: 'Intuition Bounty Board',
    description: 'Decentralized marketplace for data bounties',
  }

  // Simple visitor tracking (logs to console in development)
  const trackPageView = () => {
    if (typeof window !== 'undefined') {
      // Log page view with timestamp
      console.log('Page view:', {
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent
      })
    }
  }

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    )
  }
