/**
 * @jest-environment node
 */
import { PATCH, DELETE } from '@/app/api/admin/sizes/[sizeId]/route'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/prismadb', () => ({
  size: {
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>

const params = { params: { sizeId: 'size-123' } }
const validBody = { name: 'XL', value: 'XL', enabled: true }

const makePatchRequest = (body: object) =>
  new Request('http://localhost/api/admin/sizes/size-123', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('PATCH /api/admin/sizes/[sizeId]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when name is missing', async () => {
    const { name, ...body } = validBody
    const res = await PATCH(makePatchRequest(body), params)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Name is required')
  })

  it('returns 400 when value is missing', async () => {
    const { value, ...body } = validBody
    const res = await PATCH(makePatchRequest(body), params)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Value is required')
  })

  it('updates the size and returns 200', async () => {
    const updated = { id: 'size-123', ...validBody }
    ;(mockPrisma.size.update as jest.Mock).mockResolvedValue(updated)

    const res = await PATCH(makePatchRequest(validBody), params)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('size-123')
    expect(mockPrisma.size.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'size-123' } })
    )
  })

  it('returns 500 on database error', async () => {
    ;(mockPrisma.size.update as jest.Mock).mockRejectedValue(new Error('fail'))

    const res = await PATCH(makePatchRequest(validBody), params)

    expect(res.status).toBe(500)
  })
})

describe('DELETE /api/admin/sizes/[sizeId]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes and returns the size', async () => {
    const deleted = { id: 'size-123' }
    ;(mockPrisma.size.delete as jest.Mock).mockResolvedValue(deleted)

    const req = new Request('http://localhost/api/admin/sizes/size-123', {
      method: 'DELETE',
    })
    const res = await DELETE(req, params)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe('size-123')
  })

  it('returns 400 when sizeId is missing', async () => {
    const req = new Request('http://localhost/api/admin/sizes/')
    const res = await DELETE(req, { params: { sizeId: '' } })

    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Size id is required')
  })

  it('returns 500 on database error', async () => {
    ;(mockPrisma.size.delete as jest.Mock).mockRejectedValue(new Error('fail'))

    const req = new Request('http://localhost/api/admin/sizes/size-123', {
      method: 'DELETE',
    })
    const res = await DELETE(req, params)

    expect(res.status).toBe(500)
  })
})
