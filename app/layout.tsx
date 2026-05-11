import Navbar from '@/components/navbar'
import './globals.css'
import type { Metadata } from 'next'
import Container from '@/components/ui/container'
import { ToastProvider } from '@/providers/toast-provider'
import { getCurrentUser } from '@/actions/get-current-user'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Shopping Application created using NextJS 13',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: 'Inter, sans-serif' }}>
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
