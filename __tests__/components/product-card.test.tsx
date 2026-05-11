/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '@/components/product-card'
import useCart from '@/hooks/use-cart'
import { Decimal } from '@prisma/client/runtime/library'

jest.mock('@/hooks/use-cart')

const mockUseRouter = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockUseRouter }),
}))

const mockProduct = {
  id: 'prod-1',
  name: 'Super Hoodie That Is Very Long Name Indeed',
  price: new Decimal(59.99),
  categoryId: 'cat-1',
  sizeId: 'size-1',
  isFeatured: true,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  images: [{ id: 'img-1', url: 'https://example.com/hoodie.jpg', productId: 'prod-1', createdAt: new Date(), updatedAt: new Date() }],
  category: { id: 'cat-1', name: 'Hoodies', description: 'Warm stuff', enabled: true, createdAt: new Date(), updatedAt: new Date() },
}

function setupCartMock(inCart = false) {
  const addItem = jest.fn()
  const removeItem = jest.fn()
  ;(useCart as unknown as jest.Mock).mockReturnValue({
    items: inCart ? [mockProduct] : [],
    addItem,
    removeItem,
    removeAll: jest.fn(),
  })
  return { addItem, removeItem }
}

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the product name (truncated if long)', () => {
    setupCartMock()
    render(<ProductCard product={mockProduct} />)
    // "Super Hoodie That Is Very Long Nam..." (truncated at 30)
    expect(screen.getByText(/Super Hoodie/)).toBeInTheDocument()
  })

  it('renders the category name', () => {
    setupCartMock()
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Hoodies')).toBeInTheDocument()
  })

  it('renders the formatted price', () => {
    setupCartMock()
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('$59.99')).toBeInTheDocument()
  })

  it('renders the product image', () => {
    setupCartMock()
    render(<ProductCard product={mockProduct} />)
    const img = screen.getByAltText('Image')
    expect(img).toHaveAttribute('src', 'https://example.com/hoodie.jpg')
  })

  it('shows Add To Cart button when product is not in cart', () => {
    setupCartMock(false)
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Add To Cart')).toBeInTheDocument()
  })

  it('shows Remove from cart button when product is in cart', () => {
    setupCartMock(true)
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Remove from cart')).toBeInTheDocument()
  })

  it('calls addItem when Add To Cart is clicked', () => {
    const { addItem } = setupCartMock(false)
    render(<ProductCard product={mockProduct} />)
    fireEvent.click(screen.getByText('Add To Cart'))
    expect(addItem).toHaveBeenCalledWith(mockProduct)
  })

  it('calls removeItem when Remove from cart is clicked', () => {
    const { removeItem } = setupCartMock(true)
    render(<ProductCard product={mockProduct} />)
    fireEvent.click(screen.getByText('Remove from cart'))
    expect(removeItem).toHaveBeenCalledWith('prod-1')
  })

  it('navigates to product page on card click', () => {
    setupCartMock()
    render(<ProductCard product={mockProduct} />)
    // Click the card wrapper (the outermost div)
    const card = screen.getByText(/Super Hoodie/).closest('div[class]')!
    fireEvent.click(card)
    expect(mockUseRouter).toHaveBeenCalledWith('/product/prod-1')
  })
})
