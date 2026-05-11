/**
 * @jest-environment node
 */
import { PATCH, DELETE } from '@/app/api/admin/categories/[categoryId]/route'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/prismadb', () => ({
  category: {
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>

const params = { params: { categoryId: 'cat-123' } }
const validBody = {
  name: 'Jackets',
  description: 'All kinds of jackets',
  enabled: true,
}

const makePatchRequest = (body: object) =>
  new Request('http://localhost/api/admin/categories/cat-123', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('PATCH /api/admin/categories/[categoryId]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when name is missing', async () => {
    const { name, ...body } = validBody
    const res = await PATCH(makePatchRequest(body), params)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Name is required')
  })

  it('returns 400 when description is missing', async () => {
    const { description, ...body } = validBody
    const res = await PATCH(makePatchRequest(body), params)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Description is required')
  })

  it('updates the category and returns 200', async () => {
    const updated = { id: 'cat-123', ...validBody }
    ;(mockPrisma.category.update as jest.Mock).mockResolvedValue(updated)

    const res = await PATCH(makePatchRequest(validBody), params)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('cat-123')
    expect(mockPrisma.category.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'cat-123' } })
    )
  })

  it('returns 500 on database error', async () => {
    ;(mockPrisma.category.update as jest.Mock).mockRejectedValue(new Error('fail'))

    const res = await PATCH(makePatchRequest(validBody), params)

    expect(res.status).toBe(500)
  })
})

describe('DELETE /api/admin/categories/[categoryId]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes and returns the category', async () => {
    const deleted = { id: 'cat-123' }
    ;(mockPrisma.category.delete as jest.Mock).mockResolvedValue(deleted)

    const req = new Request('http://localhost/api/admin/categories/cat-123', {
      method: 'DELETE',
    })
    const res = await DELETE(req, params)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('cat-123')
  })

  it('returns 400 when categoryId is missing', async () => {
    const req = new Request('http://localhost/api/admin/categories/')
    const res = await DELETE(req, { params: { categoryId: '' } })

    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Category id is required')
  })

  it('returns 500 on database error', async () => {
    ;(mockPrisma.category.delete as jest.Mock).mockRejectedValue(new Error('fail'))

    const req = new Request('http://localhost/api/admin/categories/cat-123', {
      method: 'DELETE',
    })
    const res = await DELETE(req, params)

    expect(res.status).toBe(500)
  })
})
