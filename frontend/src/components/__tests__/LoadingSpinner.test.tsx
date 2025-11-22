import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should mount without crashing', () => {
    render(<LoadingSpinner />)
  })

  it('should display loading text', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Loading metrics...')).toBeInTheDocument()
  })

  it('should render spinner element', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.querySelector('.spinner')
    expect(spinner).toBeInTheDocument()
  })
})
