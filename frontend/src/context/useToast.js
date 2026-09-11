import { useContext } from "react";
import { ToastContext } from "./toastContextValue";

export default function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context.toast;
}
