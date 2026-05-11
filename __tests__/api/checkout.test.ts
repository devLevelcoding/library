/**
 * @jest-environment node
 */
import { POST } from '@/app/api/checkout/route'
import prismadb from '@/lib/prismadb'
import { Decimal } from '@prisma/client/runtime/library'

jest.mock('@/lib/prismadb', () => ({
  user: { findUnique: jest.fn() },
  product: { findMany: jest.fn() },
  order: { create: jest.fn() },
}))

jest.mock('@/actions/get-current-user', () => ({
  getSession: jest.fn(),
}))

jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}))

import { getSession } from '@/actions/get-current-user'
import { stripe } from '@/lib/stripe'

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>
const mockGetSession = getSession as jest.Mock
const mockStripe = stripe as jest.Mocked<typeof stripe>

function makeRequest(body: object) {
  return new Request('http://localhost/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/checkout', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when user is not authenticated', async () => {
    mockGetSession.mockResolvedValue(null)

    const res = await POST(makeRequest({ productsId: ['prod-1'] }))

    expect(res.status).toBe(401)
    expect(await res.text()).toBe('Unauthenticated')
  })

  it('returns 401 when session has no email', async () => {
    mockGetSession.mockResolvedValue({ user: {} })

    const res = await POST(makeRequest({ productsId: ['prod-1'] }))

    expect(res.status).toBe(401)
  })

  it('returns 401 when user not found in database', async () => {
    mockGetSession.mockResolvedValue({ user: { email: 'ghost@example.com' } })
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const res = await POST(makeRequest({ productsId: ['prod-1'] }))

    expect(res.status).toBe(401)
  })

  it('returns 400 when productsId is empty', async () => {
    mockGetSession.mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1' })

    const res = await POST(makeRequest({ productsId: [] }))

    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Product ids are required')
  })

  it('creates a Stripe session and returns its URL', async () => {
    mockGetSession.mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', email: 'user@example.com' })
    ;(mockPrisma.product.findMany as jest.Mock).mockResolvedValue([
      { id: 'prod-1', name: 'Shirt', price: new Decimal(29.99) },
    ])
    ;(mockPrisma.order.create as jest.Mock).mockResolvedValue({ id: 'order-1' })
    ;(mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
      url: 'https://checkout.stripe.com/session-abc',
    })

    const res = await POST(makeRequest({ productsId: ['prod-1'] }))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe('https://checkout.stripe.com/session-abc')
  })

  it('creates a database order before Stripe session', async () => {
    mockGetSession.mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1' })
    ;(mockPrisma.product.findMany as jest.Mock).mockResolvedValue([
      { id: 'prod-1', name: 'Shirt', price: new Decimal(10) },
    ])
    ;(mockPrisma.order.create as jest.Mock).mockResolvedValue({ id: 'order-99' })
    ;(mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValue({ url: 'https://stripe.com' })

    await POST(makeRequest({ productsId: ['prod-1'] }))

    expect(mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isPaid: false, userId: 'user-1' }),
      })
    )
  })
})
