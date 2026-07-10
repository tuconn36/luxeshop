import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'

const ToastContext = createContext(null)

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
}

let id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((tid) => {
    setToasts((prev) => prev.filter((t) => t.id !== tid))
  }, [])

  const push = useCallback((toast) => {
    const tid = ++id
    setToasts((prev) => [...prev, { id: tid, ...toast }])
    const duration = toast.duration ?? 3500
    if (duration > 0) {
      setTimeout(() => remove(tid), duration)
    }
    return tid
  }, [remove])

  const toast = {
    success: (msg, opts = {}) => push({ type: 'success', message: msg, ...opts }),
    error:   (msg, opts = {}) => push({ type: 'error',   message: msg, ...opts }),
    info:    (msg, opts = {}) => push({ type: 'info',    message: msg, ...opts }),
    warning: (msg, opts = {}) => push({ type: 'warning', message: msg, ...opts }),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = icons[t.type] || Info
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-md px-4 py-3 rounded-xl border shadow-lg animate-slide-up',
                styles[t.type] || styles.info
              )}
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm flex-1 font-medium">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="opacity-60 hover:opacity-100 -mt-1 -mr-1 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}