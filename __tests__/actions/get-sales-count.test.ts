/**
 * @jest-environment node
 */
import { getSalesCount } from '@/actions/get-sales-count'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/prismadb', () => ({
  order: {
    count: jest.fn(),
  },
}))

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>

describe('getSalesCount', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 0 when no paid orders exist', async () => {
    ;(mockPrisma.order.count as jest.Mock).mockResolvedValue(0)

    const result = await getSalesCount()

    expect(result).toBe(0)
  })

  it('returns the correct count of paid orders', async () => {
    ;(mockPrisma.order.count as jest.Mock).mockResolvedValue(42)

    const result = await getSalesCount()

    expect(result).toBe(42)
  })

  it('queries only paid orders', async () => {
    ;(mockPrisma.order.count as jest.Mock).mockResolvedValue(5)

    await getSalesCount()

    expect(mockPrisma.order.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isPaid: true }),
      })
    )
  })
})
