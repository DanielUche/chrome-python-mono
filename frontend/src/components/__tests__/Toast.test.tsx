import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ToastContainer } from '../Toast'

describe('ToastContainer', () => {
  it('renders without crashing', () => {
    const { container } = render(<ToastContainer />)
    expect(container).toBeInTheDocument()
  })

  it('renders Toastify container', () => {
    const { container } = render(<ToastContainer />)
    // react-toastify renders a div with class 'Toastify'
    const toastifyContainer = container.querySelector('.Toastify')
    expect(toastifyContainer).toBeInTheDocument()
  })
})
