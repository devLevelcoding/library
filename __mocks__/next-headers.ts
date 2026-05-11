// Mock for next/headers used in API route tests
export const headers = jest.fn(() => ({
  get: jest.fn((key: string) => {
    if (key === 'Stripe-Signature') return 'mock-stripe-signature'
    return null
  }),
}))

export const cookies = jest.fn(() => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
}))
