import { toast } from 'react-toastify';

export default (type: 'error' | 'success' | 'info', message: string | JSX.Element, icon?: boolean) => {
  let bgColor = 'bg-red-200';
  if (type === 'success') {
    bgColor = 'bg-green-200';
  }
  if (type === 'info') {
    bgColor = 'bg-blue-200';
  }
  return toast[type](message, {
    className: `${bgColor} text-sm text-black`,
    position: toast.POSITION.TOP_RIGHT,
    icon
  });
};
