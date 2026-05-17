import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#080808',
  colorScheme: 'dark light',
}

export const metadata: Metadata = {
  title: 'Ramjith Radhakrishnan — Automotive Software & Test Engineer',
  description: 'Senior Automotive Software & Test Engineer with 10+ years building safer vehicles and smarter systems. Project Lead at Volvo Cars, EV Programs.',
  keywords: ['automotive engineer', 'test engineer', 'AUTOSAR', 'ISO 26262', 'Volvo Cars', 'ADAS', 'EV validation', 'functional safety'],
  authors: [{ name: 'Ramjith Radhakrishnan' }],
  openGraph: {
    title: 'Ramjith Radhakrishnan — Automotive Software & Test Engineer',
    description: 'Building Safer Vehicles. Smarter Systems. Faster Futures.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ramjith Radhakrishnan — Automotive Engineer',
    description: 'Building Safer Vehicles. Smarter Systems. Faster Futures.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[var(--bg)] text-[var(--text)] antialiased transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
