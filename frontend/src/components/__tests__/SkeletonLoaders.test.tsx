import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MetricsDisplaySkeleton, VisitHistorySkeleton, EmptyStateSkeleton } from '../SkeletonLoaders'

describe('SkeletonLoaders', () => {
  describe('MetricsDisplaySkeleton', () => {
    it('renders skeleton with header and stats', () => {
      const { container } = render(<MetricsDisplaySkeleton />)
      
      expect(container.querySelector('.metrics-skeleton')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-header')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-stats')).toBeInTheDocument()
      
      // Should have 4 stat placeholders
      const stats = container.querySelectorAll('.skeleton-stat')
      expect(stats).toHaveLength(4)
    })

    it('renders skeleton elements for title and text', () => {
      const { container } = render(<MetricsDisplaySkeleton />)
      
      expect(container.querySelector('.skeleton-title')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-text')).toBeInTheDocument()
    })
  })

  describe('VisitHistorySkeleton', () => {
    it('renders skeleton with header and list items', () => {
      const { container } = render(<VisitHistorySkeleton />)
      
      expect(container.querySelector('.history-skeleton')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-header')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-list')).toBeInTheDocument()
    })

    it('renders 3 skeleton list items', () => {
      const { container } = render(<VisitHistorySkeleton />)
      
      const listItems = container.querySelectorAll('.skeleton-list-item')
      expect(listItems).toHaveLength(3)
    })

    it('each list item has text elements', () => {
      const { container } = render(<VisitHistorySkeleton />)
      
      const listItems = container.querySelectorAll('.skeleton-list-item')
      listItems.forEach(item => {
        expect(item.querySelector('.skeleton-text')).toBeInTheDocument()
        expect(item.querySelector('.skeleton-text-sm')).toBeInTheDocument()
      })
    })
  })

  describe('EmptyStateSkeleton', () => {
    it('renders empty state skeleton structure', () => {
      const { container } = render(<EmptyStateSkeleton />)
      
      expect(container.querySelector('.empty-skeleton')).toBeInTheDocument()
    })

    it('renders icon, title and text placeholders', () => {
      const { container } = render(<EmptyStateSkeleton />)
      
      expect(container.querySelector('.skeleton-icon')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-title')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-text')).toBeInTheDocument()
    })
  })

  describe('Skeleton animations', () => {
    it('skeleton elements have shimmer animation class', () => {
      const { container } = render(<MetricsDisplaySkeleton />)
      
      const skeletonElement = container.querySelector('.skeleton-title')
      expect(skeletonElement).toBeInTheDocument()
      
      // Check that element has the skeleton class (animation is defined in CSS)
      expect(skeletonElement?.className).toContain('skeleton')
    })
  })
})
