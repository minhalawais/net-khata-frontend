import { toast as sonnerToast, type ExternalToast } from "sonner"
import type { CSSProperties, ReactNode } from "react"

type LegacyToastOptions = ExternalToast & {
  autoClose?: number
  style?: CSSProperties
}

const mapOptions = (options?: LegacyToastOptions): ExternalToast => {
  if (!options) return {}

  const { autoClose, style: _legacyStyle, ...rest } = options
  return {
    duration: typeof autoClose === "number" ? autoClose : rest.duration,
    ...rest,
  }
}

export const toast = {
  success: (message: string, options?: LegacyToastOptions) => sonnerToast.success(message, mapOptions(options)),
  error: (message: string, options?: LegacyToastOptions) => sonnerToast.error(message, mapOptions(options)),
  info: (message: string, options?: LegacyToastOptions) => sonnerToast.info(message, mapOptions(options)),
  warning: (message: string, options?: LegacyToastOptions) => sonnerToast.warning(message, mapOptions(options)),
  warn: (message: string, options?: LegacyToastOptions) => sonnerToast.warning(message, mapOptions(options)),
  message: (message: string, options?: LegacyToastOptions) => sonnerToast.message(message, mapOptions(options)),
  loading: (message: string, options?: LegacyToastOptions) => sonnerToast.loading(message, mapOptions(options)),
  custom: (jsx: ReactNode, options?: LegacyToastOptions) => sonnerToast.custom(() => jsx, mapOptions(options)),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  promise: sonnerToast.promise,
}

export type AppToast = typeof toast
