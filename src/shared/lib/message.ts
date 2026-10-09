import { toast } from "sonner"

export const message = {
  show: toast,
  success: toast.success,
  error: toast.error,
  warning: toast.warning,
  info: toast.info,
  loading: toast.loading,
  update: (
    id: string | number,
    text: string,
    options?: Parameters<typeof toast>[1],
  ) => toast(text, { ...options, id }),
  dismiss: toast.dismiss,
}
