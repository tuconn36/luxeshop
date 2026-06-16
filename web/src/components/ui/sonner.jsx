import { Toaster as Sonner } from "sonner"

function SonnerToaster({ ...props }) {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      style={{ "--normal-bg": "var(--popover)", "--normal-text": "var(--popover-foreground)", "--normal-border": "var(--border)" }}
      {...props}
    />
  )
}

export { SonnerToaster as Toaster }
