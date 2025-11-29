import { ToastContainer as ToastifyContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function ToastContainer() {
  return (
    <ToastifyContainer
      position="top-right"
      limit={1}
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
}
