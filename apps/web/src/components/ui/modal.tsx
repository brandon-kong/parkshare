"use client";

import { useCallback, useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabelledBy?: string;
}

const FOCUSABLE_SELECTORS = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function Modal({
  isOpen,
  onClose,
  children,
  ariaLabelledBy,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Move focus into modal on first Tab press (without auto-focusing on open)
  useEffect(() => {
    if (!isOpen) return;

    function handleFirstTab(e: KeyboardEvent) {
      if (e.key === "Tab" && modalRef.current) {
        const activeElement = document.activeElement;
        const isInsideModal = modalRef.current.contains(activeElement);

        if (!isInsideModal) {
          e.preventDefault();
          const focusableElements =
            modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
          if (focusableElements.length > 0) {
            if (e.shiftKey) {
              focusableElements[focusableElements.length - 1]?.focus();
            } else {
              focusableElements[0]?.focus();
            }
          }
        }
      }
    }

    document.addEventListener("keydown", handleFirstTab, true);
    return () => document.removeEventListener("keydown", handleFirstTab, true);
  }, [isOpen]);

  // Blur elements and return focus when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Blur any focused element inside the modal
      if (modalRef.current?.contains(document.activeElement)) {
        (document.activeElement as HTMLElement)?.blur();
      }

      // Return focus to previously active element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Blur focused element first to dismiss any popups (e.g., password managers)
        (document.activeElement as HTMLElement)?.blur();
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements =
          modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: if on first element, go to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: if on last element, go to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close modal"
        tabIndex={-1}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          className="relative bg-white rounded-4xl w-full max-w-xl max-h-[90vh] overflow-y-auto pointer-events-auto"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
