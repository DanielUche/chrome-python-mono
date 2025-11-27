/**
 * Toast notification utilities using react-toastify
 */

import { toast } from 'react-toastify'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

/**
 * Show a toast notification
 */
export const showToast = (message: string, type: ToastType = 'info') => {
  toast[type](message, {
    position: 'bottom-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  })
}
