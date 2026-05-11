/**
 * @jest-environment node
 */
import { POST, GET } from '@/app/api/admin/products/route'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/prismadb', () => ({
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
}))

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>

const validBody = {
  name: 'Cool Shirt',
  price: 29.99,
  categoryId: 'cat-1',
  sizeId: 'size-1',
  images: [{ url: 'https://example.com/img.png' }],
  isFeatured: false,
  isArchived: false,
}

function makeRequest(body: object) {
  return new Request('http://localhost/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/products', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when name is missing', async () => {
    const { name, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Name is required')
  })

  it('returns 400 when images are missing', async () => {
    const res = await POST(makeRequest({ ...validBody, images: [] }))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Images are required')
  })

  it('returns 400 when price is missing', async () => {
    const { price, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Price is required')
  })

  it('returns 400 when categoryId is missing', async () => {
    const { categoryId, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Category id is required')
  })

  it('returns 400 when sizeId is missing', async () => {
    const { sizeId, ...body } = validBody
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Size id is required')
  })

  it('creates a product and returns 200 with valid data', async () => {
    const created = { id: 'prod-1', ...validBody }
    ;(mockPrisma.product.create as jest.Mock).mockResolvedValue(created)

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('prod-1')
    expect(mockPrisma.product.create).toHaveBeenCalledTimes(1)
  })

  it('returns 500 on unexpected database error', async () => {
    ;(mockPrisma.product.create as jest.Mock).mockRejectedValue(new Error('DB crash'))

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(500)
    expect(await res.text()).toBe('Internal error')
  })
})

describe('GET /api/admin/products', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns a list of products', async () => {
    const products = [{ id: 'p1' }, { id: 'p2' }]
    ;(mockPrisma.product.findMany as jest.Mock).mockResolvedValue(products)

    const req = new Request('http://localhost/api/admin/products')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveLength(2)
  })

  it('filters by categoryId query param', async () => {
    ;(mockPrisma.product.findMany as jest.Mock).mockResolvedValue([])

    const req = new Request('http://localhost/api/admin/products?categoryId=cat-1')
    await GET(req)

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ categoryId: 'cat-1' }),
      })
    )
  })

  it('filters by sizeId query param', async () => {
    ;(mockPrisma.product.findMany as jest.Mock).mockResolvedValue([])

    const req = new Request('http://localhost/api/admin/products?sizeId=size-1')
    await GET(req)

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ sizeId: 'size-1' }),
      })
    )
  })

  it('filters isFeatured when param is present', async () => {
    ;(mockPrisma.product.findMany as jest.Mock).mockResolvedValue([])

    const req = new Request('http://localhost/api/admin/products?isFeatured=true')
    await GET(req)

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isFeatured: true }),
      })
    )
  })

  it('always excludes archived products', async () => {
    ;(mockPrisma.product.findMany as jest.Mock).mockResolvedValue([])

    const req = new Request('http://localhost/api/admin/products')
    await GET(req)

    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isArchived: false }),
      })
    )
  })

  it('returns 500 on database error', async () => {
    ;(mockPrisma.product.findMany as jest.Mock).mockRejectedValue(new Error('fail'))

    const req = new Request('http://localhost/api/admin/products')
    const res = await GET(req)

    expect(res.status).toBe(500)
  })
})
