import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cn } from "@/lib/utils"

const Dialog = AlertDialogPrimitive.Root
const DialogTrigger = AlertDialogPrimitive.Trigger
const DialogPortal = AlertDialogPrimitive.Portal

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/65 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)'
    }}
    {...props}
  />
))
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 10000,
        pointerEvents: 'none'
      }}
    >
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          "pointer-events-auto relative w-full max-w-lg bg-background p-6 shadow-2xl rounded-2xl border flex flex-col max-h-[88vh] my-auto duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        style={{
          position: 'relative',
          margin: 'auto',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </div>
  </DialogPortal>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left flex-shrink-0", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 flex-shrink-0", className)} {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
