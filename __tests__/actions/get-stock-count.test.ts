/**
 * @jest-environment node
 */
import { getStockCount } from '@/actions/get-stock-count'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/prismadb', () => ({
  product: {
    count: jest.fn(),
  },
}))

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>

describe('getStockCount', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 0 when no active products exist', async () => {
    ;(mockPrisma.product.count as jest.Mock).mockResolvedValue(0)

    const result = await getStockCount()

    expect(result).toBe(0)
  })

  it('returns the correct count of non-archived products', async () => {
    ;(mockPrisma.product.count as jest.Mock).mockResolvedValue(15)

    const result = await getStockCount()

    expect(result).toBe(15)
  })

  it('queries only non-archived products', async () => {
    ;(mockPrisma.product.count as jest.Mock).mockResolvedValue(3)

    await getStockCount()

    expect(mockPrisma.product.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isArchived: false }),
      })
    )
  })
})
