import Navbar from '@/components/navbar'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Container from '@/components/ui/container'
import { ToastProvider } from '@/providers/toast-provider'
import { getCurrentUser } from '@/actions/get-current-user'
import Footer from '@/components/footer'
import { NavigationProgress } from '@/components/navigation-progress'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Shop', template: '%s | Shop' },
  description: 'Browse thousands of products across beauty, electronics, fashion and more.',
  robots: { index: true, follow: true },
  openGraph: {
    siteName: 'Shop',
    type: 'website',
    description: 'Browse thousands of products across beauty, electronics, fashion and more.',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()

  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://covers.openlibrary.org" />
        <link rel="dns-prefetch" href="https://covers.openlibrary.org" />
      </head>
      <body suppressHydrationWarning>
        <NavigationProgress />
        <ToastProvider />
        <Navbar currentUser={currentUser}/>
        <main className="pt-20">
          <Container>
            {children}
          </Container>
        </main>
        <Footer />
      </body>
    </html>
  )
}
