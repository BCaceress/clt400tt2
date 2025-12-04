"use client";

import {
  ToastContainer,
  type ToastContainerProps,
  toast,
  type ToastOptions,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseOptions: ToastOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
};

const containerProps: ToastContainerProps = {
  ...baseOptions,
  newestOnTop: false,
  limit: 3,
};

export function notifySuccess(message: string, options?: ToastOptions) {
  toast.success(message, { ...baseOptions, ...options });
}

export function notifyError(message: string, options?: ToastOptions) {
  toast.error(message, { ...baseOptions, ...options });
}

export function notifyInfo(message: string, options?: ToastOptions) {
  toast.info(message, { ...baseOptions, ...options });
}

export default function NotificationsProvider() {
  return <ToastContainer {...containerProps} />;
}
