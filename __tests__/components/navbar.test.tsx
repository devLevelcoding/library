/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock child components to isolate Navbar logic
jest.mock('@/components/admin-nav', () => ({
  AdminNav: ({ className }: { className?: string }) => (
    <nav data-testid="admin-nav" className={className}>Admin Nav</nav>
  ),
}))

jest.mock('@/components/user-nav', () => ({
  UserNav: ({ currentUser }: { currentUser: any }) => (
    <div data-testid="user-nav">{currentUser?.email ?? 'guest'}</div>
  ),
}))

jest.mock('@/components/categories-nav', () => ({
  __esModule: true,
  default: () => <nav data-testid="categories-nav">Categories</nav>,
}))

jest.mock('@/components/ui/container', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Import AFTER mocks are set up
import Navbar from '@/components/navbar'

const adminUser = {
  id: 'user-1',
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
  role: 'admin',
  hashedPassword: 'hashed',
  emailVerified: null,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const regularUser = { ...adminUser, role: 'user', email: 'user@example.com' }

/**
 * Navbar is an async server component.
 * Call it as an async function and render the returned element with RTL.
 */
async function renderNavbar(currentUser: typeof adminUser | null) {
  const element = await (Navbar as any)({ currentUser })
  return render(element)
}

describe('Navbar', () => {
  it('renders the SHOP brand link', async () => {
    await renderNavbar(null)
    expect(screen.getByText('SHOP')).toBeInTheDocument()
  })

  it('renders categories navigation', async () => {
    await renderNavbar(null)
    expect(screen.getByTestId('categories-nav')).toBeInTheDocument()
  })

  it('renders user navigation', async () => {
    await renderNavbar(null)
    expect(screen.getByTestId('user-nav')).toBeInTheDocument()
  })

  it('shows AdminNav for admin users', async () => {
    await renderNavbar(adminUser)
    expect(screen.getByTestId('admin-nav')).toBeInTheDocument()
  })

  it('hides AdminNav for regular users', async () => {
    await renderNavbar(regularUser)
    expect(screen.queryByTestId('admin-nav')).not.toBeInTheDocument()
  })

  it('hides AdminNav when currentUser is null', async () => {
    await renderNavbar(null)
    expect(screen.queryByTestId('admin-nav')).not.toBeInTheDocument()
  })

  it('SHOP link points to home', async () => {
    await renderNavbar(null)
    const link = screen.getByText('SHOP').closest('a')
    expect(link).toHaveAttribute('href', '/')
  })
})
