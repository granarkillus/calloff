import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "AUS Call-Off Notice",
  description: 'Allied Universal Security Services Call-Off Notice',
  generator: 'next',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
