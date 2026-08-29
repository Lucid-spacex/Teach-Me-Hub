import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ 
  className, 
  size = "md", 
  text,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  const spinner = (
    <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
      </div>
    )
  }

  if (text) {
    return (
      <div className="flex flex-col items-center gap-3">
        {spinner}
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    )
  }

  return spinner
}
