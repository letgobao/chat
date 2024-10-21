import { toast as sonner } from "sonner";

type toastMode = "success" | "error" | "warning" | "info";

type toastStyle = {
  background: string;
  color: string;
};

const toastStyles: Record<toastMode, toastStyle> = {
  success: { background: "#4ade80", color: "#ffffff" },
  error: { background: "#f87171", color: "#ffffff" },
  warning: { background: "#fcd34d", color: "#ffffff" },
  info: { background: "#67e8f9", color: "#ffffff" },
} as const;

export const toast = {
  success: (message: string) =>
    sonner.success(message, { style: toastStyles.success }),
  error: (message: string) =>
    sonner.error(message, { style: toastStyles.error }),
  info: (message: string) =>
    sonner.info(message, { style: toastStyles.info }),
  warning: (message: string) =>
    sonner.warning(message, { style: toastStyles.warning }),
};

export const defaultError = (error: any) => {
  toast.error(
    error.response?.data || "Unexpected error occurred!"
  );
};
