import { describe, it, expect, vi, beforeEach } from 'vitest'
import { showToast } from '../toast'
import { toast } from 'react-toastify'

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

describe('showToast utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows success toast', () => {
    showToast('Success message', 'success')
    
    expect(toast.success).toHaveBeenCalledWith('Success message', {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  })

  it('shows error toast', () => {
    showToast('Error message', 'error')
    
    expect(toast.error).toHaveBeenCalledWith('Error message', {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  })

  it('shows info toast by default', () => {
    showToast('Info message')
    
    expect(toast.info).toHaveBeenCalledWith('Info message', {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  })

  it('shows warning toast', () => {
    showToast('Warning message', 'warning')
    
    expect(toast.warning).toHaveBeenCalledWith('Warning message', {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  })
})
