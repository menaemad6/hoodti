import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  position?: "right" | "left" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  closeButtonClassName?: string;
  showCloseButton?: boolean;
  isLoading?: boolean;
  disableOverlayClick?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  children,
  title,
  position = "right",
  size = "md",
  className,
  contentClassName,
  headerClassName,
  closeButtonClassName,
  showCloseButton = true,
  isLoading = false,
  disableOverlayClick = false,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(open);

  React.useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (internalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [internalOpen, onClose]);

  const handleOverlayClick = () => {
    if (!disableOverlayClick && !isLoading) {
      onClose();
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "left":
        return "left-0 top-0 bottom-0 h-full";
      case "right":
        return "right-0 top-0 bottom-0 h-full";
      case "top":
        return "top-0 left-0 right-0 w-full";
      case "bottom":
        return "bottom-0 left-0 right-0 w-full";
      default:
        return "right-0 top-0 bottom-0 h-full";
    }
  };

  const getSizeClasses = () => {
    const sizes = {
      right: {
        sm: "w-1/4",
        md: "w-1/3",
        lg: "w-1/2",
        xl: "w-2/3",
        full: "w-full",
      },
      left: {
        sm: "w-1/4",
        md: "w-1/3",
        lg: "w-1/2",
        xl: "w-2/3",
        full: "w-full",
      },
      top: {
        sm: "h-1/4",
        md: "h-1/3",
        lg: "h-1/2",
        xl: "h-2/3",
        full: "h-full",
      },
      bottom: {
        sm: "h-1/4",
        md: "h-1/3",
        lg: "h-1/2",
        xl: "h-2/3",
        full: "h-full",
      },
    };

    return sizes[position][size];
  };

  const getTransformClass = () => {
    switch (position) {
      case "left":
        return internalOpen ? "translate-x-0" : "-translate-x-full";
      case "right":
        return internalOpen ? "translate-x-0" : "translate-x-full";
      case "top":
        return internalOpen ? "translate-y-0" : "-translate-y-full";
      case "bottom":
        return internalOpen ? "translate-y-0" : "translate-y-full";
      default:
        return internalOpen ? "translate-x-0" : "translate-x-full";
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex">
      <div
        className={cn(
          "fixed inset-0 transition-opacity bg-black bg-opacity-50 dark:bg-opacity-70"
        )}
        onClick={handleOverlayClick}
      />
      <div
        className={cn(
          "absolute z-50 bg-white dark:bg-gray-900 shadow-xl overflow-y-auto",
          "transition-transform duration-300 ease-in-out",
          getPositionClasses(),
          getSizeClasses(),
          getTransformClass(),
          className
        )}
      >
        {title && (
          <div
            className={cn(
              "px-4 py-3 border-b dark:border-gray-800 flex justify-between items-center",
              headerClassName
            )}
          >
            <div className="font-semibold text-lg dark:text-gray-100">{title}</div>
            {showCloseButton && (
              <button
                onClick={onClose}
                disabled={isLoading}
                className={cn(
                  "p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  closeButtonClassName
                )}
              >
                <X size={20} className="dark:text-gray-300" />
              </button>
            )}
          </div>
        )}
        <div className={cn("p-4 flex-1", contentClassName)}>{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
