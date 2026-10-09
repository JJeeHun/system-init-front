import { toast } from "sonner"

export const message = {
  show: toast,
  success: (text: Parameters<typeof toast.success>[0], options?: Parameters<typeof toast.success>[1]) =>
    toast.success(text, { duration: 2500, ...options }),
  error: (text: Parameters<typeof toast.error>[0], options?: Parameters<typeof toast.error>[1]) =>
    toast.error(text, { duration: 6000, ...options }),
  warning: (text: Parameters<typeof toast.warning>[0], options?: Parameters<typeof toast.warning>[1]) =>
    toast.warning(text, { duration: 5000, ...options }),
  info: (text: Parameters<typeof toast.info>[0], options?: Parameters<typeof toast.info>[1]) =>
    toast.info(text, { duration: 3500, ...options }),
  loading: toast.loading,
  update: (
    id: string | number,
    text: string,
    options?: Parameters<typeof toast>[1],
  ) => toast(text, { ...options, id }),
  dismiss: toast.dismiss,
}
