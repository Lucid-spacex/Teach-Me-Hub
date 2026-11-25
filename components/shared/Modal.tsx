import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  open?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  showCloseButton?: boolean
  className?: string
}

export function Modal({
  open,
  isOpen,
  onOpenChange,
  onClose,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  className,
}: ModalProps) {
  const isModalOpen = open !== undefined ? open : !!isOpen
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange?.(newOpen)
    if (!newOpen && onClose) {
      onClose()
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn("modal-split w-[calc(100%-2rem)] md:max-w-5xl", className)}
      >
        <DialogHeader className="modal-split__aside">
          <div className="grid size-12 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <Sparkles className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle className="font-display text-2xl leading-tight tracking-tight sm:text-3xl">{title}</DialogTitle>
          {description && <DialogDescription className="max-w-xs text-sm leading-6">{description}</DialogDescription>}
        </DialogHeader>
        <div className="modal-split__main">
          <div className="modal-split__scroll">{children}</div>
          {footer && <DialogFooter className="modal-split__footer">{footer}</DialogFooter>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
