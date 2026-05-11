/**
 * @jest-environment node
 */
import { GET, DELETE, PATCH } from '@/app/api/admin/products/[productId]/route'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/prismadb', () => ({
  product: {
    findUnique: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
}))

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>

const params = { params: { productId: 'prod-123' } }
const validPatchBody = {
  name: 'Updated Shirt',
  price: 39.99,
  categoryId: 'cat-1',
  sizeId: 'size-1',
  images: [{ url: 'https://example.com/img.png' }],
  isFeatured: true,
  isArchived: false,
}

describe('GET /api/admin/products/[productId]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns the product when found', async () => {
    const product = { id: 'prod-123', name: 'Shirt' }
    ;(mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(product)

    const req = new Request('http://localhost/api/admin/products/prod-123')
    const res = await GET(req, params)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('prod-123')
  })

  it('returns 500 on database error', async () => {
    ;(mockPrisma.product.findUnique as jest.Mock).mockRejectedValue(new Error('fail'))

    const req = new Request('http://localhost/api/admin/products/prod-123')
    const res = await GET(req, params)

    expect(res.status).toBe(500)
  })
})

describe('DELETE /api/admin/products/[productId]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes the product and returns it', async () => {
    const deleted = { id: 'prod-123' }
    ;(mockPrisma.product.delete as jest.Mock).mockResolvedValue(deleted)

    const req = new Request('http://localhost/api/admin/products/prod-123', {
      method: 'DELETE',
    })
    const res = await DELETE(req, params)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('prod-123')
  })

  it('returns 400 when productId is missing', async () => {
    const req = new Request('http://localhost/api/admin/products/')
    const res = await DELETE(req, { params: { productId: '' } })

    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Product id is required')
  })

  it('returns 500 on database error', async () => {
    ;(mockPrisma.product.delete as jest.Mock).mockRejectedValue(new Error('fail'))

    const req = new Request('http://localhost/api/admin/products/prod-123', {
      method: 'DELETE',
    })
    const res = await DELETE(req, params)

    expect(res.status).toBe(500)
  })
})

describe('PATCH /api/admin/products/[productId]', () => {
  beforeEach(() => jest.clearAllMocks())

  const makePatchRequest = (body: object) =>
    new Request('http://localhost/api/admin/products/prod-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

  it('returns 400 when name is missing', async () => {
    const { name, ...body } = validPatchBody
    const res = await PATCH(makePatchRequest(body), params)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Name is required')
  })

  it('returns 400 when images are missing', async () => {
    const res = await PATCH(makePatchRequest({ ...validPatchBody, images: [] }), params)
    expect(res.status).toBe(400)
  })

  it('returns 400 when price is missing', async () => {
    const { price, ...body } = validPatchBody
    const res = await PATCH(makePatchRequest(body), params)
    expect(res.status).toBe(400)
  })

  it('returns 400 when categoryId is missing', async () => {
    const { categoryId, ...body } = validPatchBody
    const res = await PATCH(makePatchRequest(body), params)
    expect(res.status).toBe(400)
  })

  it('returns 400 when sizeId is missing', async () => {
    const { sizeId, ...body } = validPatchBody
    const res = await PATCH(makePatchRequest(body), params)
    expect(res.status).toBe(400)
  })

  it('updates the product and returns 200', async () => {
    const updated = { id: 'prod-123', ...validPatchBody }
    ;(mockPrisma.product.update as jest.Mock).mockResolvedValue(updated)

    const res = await PATCH(makePatchRequest(validPatchBody), params)

    expect(res.status).toBe(200)
    // update is called twice (once to clear images, once to add them)
    expect(mockPrisma.product.update).toHaveBeenCalledTimes(2)
  })

  it('returns 500 on database error', async () => {
    ;(mockPrisma.product.update as jest.Mock).mockRejectedValue(new Error('fail'))

    const res = await PATCH(makePatchRequest(validPatchBody), params)

    expect(res.status).toBe(500)
  })
})
