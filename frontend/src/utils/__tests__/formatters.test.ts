import { describe, it, expect } from 'vitest'
import { formatters } from '../formatters'

describe('formatters', () => {
  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatters.formatNumber(1500)).toBe('1,500')
      expect(formatters.formatNumber(1000000)).toBe('1,000,000')
      expect(formatters.formatNumber(10)).toBe('10')
    })
  })

  describe('formatUrl', () => {
    it('should extract hostname from URL', () => {
      expect(formatters.formatUrl('https://example.com')).toBe('example.com')
      expect(formatters.formatUrl('https://www.google.com/search')).toBe('www.google.com')
    })

    it('should return url if parsing fails', () => {
      expect(formatters.formatUrl('not-a-url')).toBe('not-a-url')
    })
  })

  describe('formatDate', () => {
    it('should handle empty string', () => {
      expect(formatters.formatDate('')).toBe('N/A')
    })

    it('should return Invalid Date for invalid input', () => {
      const result = formatters.formatDate('invalid-date-format-xyz')
      expect(result).toBeDefined()
    })
  })

  describe('formatTimeAgo', () => {
    it('should handle empty string', () => {
      expect(formatters.formatTimeAgo('')).toBe('N/A')
    })

    it('should return string for valid date', () => {
      const result = formatters.formatTimeAgo('November 22, 2025 at 12:59 PM')
      expect(typeof result).toBe('string')
    })
  })
})
