/**
 * @jest-environment node
 */
import { getTotalRevenue } from '@/actions/get-total-revenue'
import prismadb from '@/lib/prismadb'
import { Decimal } from '@prisma/client/runtime/library'

jest.mock('@/lib/prismadb', () => ({
  order: {
    findMany: jest.fn(),
  },
}))

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>

describe('getTotalRevenue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 0 when there are no paid orders', async () => {
    ;(mockPrisma.order.findMany as jest.Mock).mockResolvedValue([])

    const result = await getTotalRevenue()

    expect(result).toBe(0)
  })

  it('returns the correct total for a single order with one item', async () => {
    ;(mockPrisma.order.findMany as jest.Mock).mockResolvedValue([
      {
        orderItems: [{ product: { price: new Decimal(49.99) } }],
      },
    ])

    const result = await getTotalRevenue()

    expect(result).toBeCloseTo(49.99)
  })

  it('sums prices across multiple order items in one order', async () => {
    ;(mockPrisma.order.findMany as jest.Mock).mockResolvedValue([
      {
        orderItems: [
          { product: { price: new Decimal(10) } },
          { product: { price: new Decimal(20) } },
        ],
      },
    ])

    const result = await getTotalRevenue()

    expect(result).toBeCloseTo(30)
  })

  it('sums totals across multiple orders', async () => {
    ;(mockPrisma.order.findMany as jest.Mock).mockResolvedValue([
      {
        orderItems: [{ product: { price: new Decimal(100) } }],
      },
      {
        orderItems: [{ product: { price: new Decimal(200) } }],
      },
    ])

    const result = await getTotalRevenue()

    expect(result).toBeCloseTo(300)
  })

  it('queries only paid orders', async () => {
    ;(mockPrisma.order.findMany as jest.Mock).mockResolvedValue([])

    await getTotalRevenue()

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isPaid: true }),
      })
    )
  })
})
