import Navbar from '@/components/navbar'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Container from '@/components/ui/container'
import { ToastProvider } from '@/providers/toast-provider'
import { getCurrentUser } from '@/actions/get-current-user'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Shop', template: '%s | Shop' },
  description: 'Browse thousands of products across beauty, electronics, fashion and more.',
  openGraph: {
    siteName: 'Shop',
    type: 'website',
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
      <head />
      <body>
        <ToastProvider />
        <Navbar currentUser={currentUser}/>
        <div className="pt-20">
          <Container>
            {children}
          </Container>
        </div>
        <Footer />
      </body>
    </html>
  )
}
