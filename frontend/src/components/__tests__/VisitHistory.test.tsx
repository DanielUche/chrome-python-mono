import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import { VisitHistory } from '../VisitHistory'
import type { PageMetric } from '../../types/metrics'

describe('VisitHistory', () => {
  const mockVisits: PageMetric[] = [
    {
      id: 1,
      url: 'https://example.com',
      link_count: 10,
      word_count: 500,
      image_count: 5,
      datetime_visited: 'November 22, 2025 at 12:59 PM',
    },
    {
      id: 2,
      url: 'https://example.com',
      link_count: 15,
      word_count: 600,
      image_count: 8,
      datetime_visited: 'November 21, 2025 at 10:30 AM',
    },
  ]

  it('should mount without crashing', () => {
    render(<VisitHistory visits={mockVisits} />)
  })

  it('should display recent visits heading', () => {
    render(<VisitHistory visits={mockVisits} />)
    expect(screen.getByText('Recent Visits')).toBeInTheDocument()
  })

  it('should display visit items', () => {
    render(<VisitHistory visits={mockVisits} />)
    const visitItems = screen.getAllByRole('generic')
    expect(visitItems.length).toBeGreaterThan(0)
  })

  it('should display stat badges', () => {
    render(<VisitHistory visits={mockVisits} />)
    expect(screen.getByText('10 links')).toBeInTheDocument()
    expect(screen.getByText('500 words')).toBeInTheDocument()
    expect(screen.getByText('5 images')).toBeInTheDocument()
  })

  it('should not render when visits list is empty', () => {
    const { container } = render(<VisitHistory visits={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should show more visits count when over 5', () => {
    const manyVisits = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      url: 'https://example.com',
      link_count: 10,
      word_count: 500,
      image_count: 5,
      datetime_visited: 'November 22, 2025 at 12:59 PM',
    }))

    render(<VisitHistory visits={manyVisits} />)
    expect(screen.getByText('+3 more visits')).toBeInTheDocument()
  })
})
