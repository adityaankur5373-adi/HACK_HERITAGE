import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { ToastContext } from "./toastContextValue";
const icons = { success: CheckCircle2, error: XCircle, info: Info };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const toast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);
  const value = useMemo(() => ({ toast, dismiss }), [dismiss, toast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite">
        {toasts.map(({ id, message, type }) => {
          const Icon = icons[type] || Info;
          const style = type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : type === "error" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-slate-200 bg-white text-slate-900";
          return <div key={id} className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-semibold shadow-lg ${style}`}><Icon size={18} className="mt-0.5 shrink-0" /><span className="flex-1">{message}</span><button type="button" onClick={() => dismiss(id)} aria-label="Dismiss notification" className="shrink-0 opacity-70 hover:opacity-100"><X size={16} /></button></div>;
        })}
      </div>
    </ToastContext.Provider>
  );
}
