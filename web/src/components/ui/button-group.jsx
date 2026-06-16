import { cn } from "@/lib/utils"

function ButtonGroup({ className, ...props }) {
  return (
    <div
      data-slot="button-group"
      className={cn(
        "flex items-center [&>*:not(:first-child)]:-ml-px [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:first-child:not(:last-child)]:rounded-r-none [&>*:last-child:not(:first-child)]:rounded-l-none",
        className
      )}
      {...props}
    />
  )
}

export { ButtonGroup }
