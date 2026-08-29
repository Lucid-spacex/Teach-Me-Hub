import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SegmentedControlProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div className={cn("inline-flex rounded-lg border p-1", className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1",
            value === option.value ? "shadow-sm" : "text-muted-foreground"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
