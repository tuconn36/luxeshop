import { cn } from "@/lib/utils"

function Spinner({ className, size = "default", ...props }) {
  return (
    <svg
      data-slot="spinner"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "animate-spin",
        size === "sm" && "size-4",
        size === "default" && "size-6",
        size === "lg" && "size-8",
        className
      )}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

export { Spinner }
