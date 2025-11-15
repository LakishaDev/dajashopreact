// FlashModal.jsx — "milk" minimalist (2s auto-close)
// Bela, staklasta pozadina, lucide-ikonice, ESC i klik van zatvara

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function FlashModal({
  open,
  title,
  subtitle,
  onClose,
  duration = 2000,
  icon, // po želji prepiši ikonicu: npr. <CheckCircle2 />
}) {
  // Auto close
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-80 grid place-items-center p-4 backdrop-blur-xxs"
          onClick={() => onClose?.()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-live="polite"
          role="alertdialog"
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 text-center shadow-lg ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white">
              {icon ?? <CheckCircle2 size={22} aria-hidden="true" />}
            </div>

            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
            {subtitle && (
              <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
