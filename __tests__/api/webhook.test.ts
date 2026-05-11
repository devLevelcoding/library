/**
 * @jest-environment node
 */
import { POST } from '@/app/api/webhook/route'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/prismadb', () => ({
  order: {
    update: jest.fn(),
  },
}))

jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}))

import { stripe } from '@/lib/stripe'

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>
const mockStripe = stripe as jest.Mocked<typeof stripe>

function makeRequest(body: string = '{}') {
  return new Request('http://localhost/api/webhook', {
    method: 'POST',
    body,
  })
}

describe('POST /api/webhook', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when Stripe signature verification fails', async () => {
    ;(mockStripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const res = await POST(makeRequest())

    expect(res.status).toBe(400)
    expect(await res.text()).toContain('Webhook Error')
  })

  it('returns 200 without updating order for unhandled event types', async () => {
    ;(mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'payment_intent.created',
      data: {
        object: {
          customer_details: { address: null, phone: null },
          metadata: {},
        },
      },
    })

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(mockPrisma.order.update).not.toHaveBeenCalled()
  })

  it('updates order to paid on checkout.session.completed', async () => {
    const mockSession = {
      metadata: { orderId: 'order-123' },
      customer_details: {
        phone: '+1234567890',
        address: {
          line1: '123 Main St',
          line2: null,
          city: 'Springfield',
          state: 'IL',
          postal_code: '62701',
          country: 'US',
        },
      },
    }

    ;(mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: mockSession },
    })
    ;(mockPrisma.order.update as jest.Mock).mockResolvedValue({ id: 'order-123' })

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(mockPrisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-123' },
        data: expect.objectContaining({
          isPaid: true,
          phone: '+1234567890',
        }),
      })
    )
  })

  it('builds address string from address components', async () => {
    const mockSession = {
      metadata: { orderId: 'order-456' },
      customer_details: {
        phone: '',
        address: {
          line1: '1 Infinite Loop',
          line2: null,
          city: 'Cupertino',
          state: 'CA',
          postal_code: '95014',
          country: 'US',
        },
      },
    }

    ;(mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: mockSession },
    })
    ;(mockPrisma.order.update as jest.Mock).mockResolvedValue({ id: 'order-456' })

    await POST(makeRequest())

    const callArg = (mockPrisma.order.update as jest.Mock).mock.calls[0][0]
    expect(callArg.data.address).toContain('1 Infinite Loop')
    expect(callArg.data.address).toContain('Cupertino')
    // null values (line2) should be filtered out
    expect(callArg.data.address).not.toContain('null')
  })
})
