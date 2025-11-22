import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricsDisplay } from '../MetricsDisplay'
import type { PageMetrics } from '../../types/metrics'

describe('MetricsDisplay', () => {
  const mockMetrics: PageMetrics = {
    url: 'https://example.com',
    link_count: 25,
    word_count: 1500,
    image_count: 8,
    last_visited: 'November 22, 2025 at 12:59 PM',
    visit_count: 5,
  }

  it('should mount without crashing', () => {
    render(<MetricsDisplay metrics={mockMetrics} />)
  })

  it('should display page metrics heading', () => {
    render(<MetricsDisplay metrics={mockMetrics} />)
    expect(screen.getByText('Page Metrics')).toBeInTheDocument()
  })

  it('should display all metric labels', () => {
    render(<MetricsDisplay metrics={mockMetrics} />)
    expect(screen.getByText('Links Found')).toBeInTheDocument()
    expect(screen.getByText('Words')).toBeInTheDocument()
    expect(screen.getByText('Images')).toBeInTheDocument()
    expect(screen.getByText('Visit Count')).toBeInTheDocument()
  })

  it('should display metric values', () => {
    render(<MetricsDisplay metrics={mockMetrics} />)
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('1,500')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should display last visited info', () => {
    render(<MetricsDisplay metrics={mockMetrics} />)
    expect(screen.getByText('Last Visited:')).toBeInTheDocument()
  })

  it('should display URL info', () => {
    render(<MetricsDisplay metrics={mockMetrics} />)
    expect(screen.getByText('URL:')).toBeInTheDocument()
  })
})
