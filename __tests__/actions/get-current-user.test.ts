/**
 * @jest-environment node
 */
import { getCurrentUser, getSession } from '@/actions/get-current-user'
import prismadb from '@/lib/prismadb'

jest.mock('@/lib/prismadb', () => ({
  user: {
    findUnique: jest.fn(),
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/pages/api/auth/[...nextauth]', () => ({
  authOptions: {},
}))

import { getServerSession } from 'next-auth'

const mockPrisma = prismadb as jest.Mocked<typeof prismadb>
const mockGetServerSession = getServerSession as jest.Mock

describe('getSession', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when there is no session', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const session = await getSession()

    expect(session).toBeNull()
  })

  it('returns the session object when authenticated', async () => {
    const fakeSession = { user: { email: 'admin@example.com' } }
    mockGetServerSession.mockResolvedValue(fakeSession)

    const session = await getSession()

    expect(session).toEqual(fakeSession)
  })
})

describe('getCurrentUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when there is no session', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const user = await getCurrentUser()

    expect(user).toBeNull()
  })

  it('returns null when session has no email', async () => {
    mockGetServerSession.mockResolvedValue({ user: {} })

    const user = await getCurrentUser()

    expect(user).toBeNull()
  })

  it('returns the user when session and db record exist', async () => {
    const fakeSession = { user: { email: 'admin@example.com' } }
    const fakeUser = { id: 'user-1', email: 'admin@example.com', role: 'admin' }

    mockGetServerSession.mockResolvedValue(fakeSession)
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUser)

    const user = await getCurrentUser()

    expect(user).toEqual(fakeUser)
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@example.com' },
    })
  })

  it('returns null when prismadb throws', async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: 'a@b.com' } })
    ;(mockPrisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'))

    const user = await getCurrentUser()

    expect(user).toBeNull()
  })
})
