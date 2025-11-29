

import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export const showToast = (
  message: string,
  type: ToastType = 'info',
  options?: ToastOptions
) => {
  toast.dismiss();
  toast[type](message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  });
};
