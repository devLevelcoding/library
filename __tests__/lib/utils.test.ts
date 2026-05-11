import { cn, formatter, truncate } from '@/lib/utils'

describe('cn (class name merger)', () => {
  it('returns a single class name unchanged', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('conditionally includes classes', () => {
    expect(cn('base', true && 'included', false && 'excluded')).toBe(
      'base included'
    )
  })

  it('handles undefined and null gracefully', () => {
    expect(cn('a', undefined, null as any, 'b')).toBe('a b')
  })

  it('handles object syntax', () => {
    expect(cn({ 'active': true, 'disabled': false })).toBe('active')
  })

  it('returns empty string when no args', () => {
    expect(cn()).toBe('')
  })
})

describe('formatter (currency)', () => {
  it('formats zero as $0.00', () => {
    expect(formatter.format(0)).toBe('$0.00')
  })

  it('formats integer values with .00', () => {
    expect(formatter.format(10)).toBe('$10.00')
  })

  it('formats decimal values correctly', () => {
    expect(formatter.format(9.99)).toBe('$9.99')
  })

  it('formats large numbers with commas', () => {
    expect(formatter.format(1000)).toBe('$1,000.00')
  })

  it('uses USD currency symbol', () => {
    expect(formatter.format(1)).toContain('$')
  })
})

describe('truncate', () => {
  it('returns the string unchanged when shorter than max', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('returns the string unchanged when equal to max', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates and appends ellipsis when longer than max', () => {
    expect(truncate('hello world', 8)).toBe('hello...')
  })

  it('truncates to exactly max - 3 characters plus ellipsis', () => {
    const result = truncate('abcdefghij', 7)
    expect(result).toBe('abcd...')
    expect(result.length).toBe(7)
  })

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })

  it('handles max of 3 (produces only ellipsis)', () => {
    expect(truncate('hello', 3)).toBe('...')
  })
})
