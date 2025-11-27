/**
 * Toast container component using react-toastify
 */

import { ToastContainer as ToastifyContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

/**
 * Toast container component - add this once to your app root
 */
export function ToastContainer() {
  return <ToastifyContainer />
}

