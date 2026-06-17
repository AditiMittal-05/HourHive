import * as React from "react";
import type { ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 4000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
};

type State = { toasts: ToasterToast[] };

let count = 0;
const genId = () => `toast-${++count}`;
let memState: State = { toasts: [] };
const listeners: Array<(state: State) => void> = [];

function dispatch(action: { type: "ADD" | "REMOVE" | "DISMISS"; toast?: ToasterToast; toastId?: string }) {
  if (action.type === "ADD") {
    memState = { toasts: [action.toast!, ...memState.toasts].slice(0, TOAST_LIMIT) };
  } else if (action.type === "REMOVE") {
    memState = { toasts: memState.toasts.filter((t) => t.id !== action.toastId) };
  } else if (action.type === "DISMISS") {
    memState = {
      toasts: memState.toasts.map((t) =>
        t.id === action.toastId || !action.toastId ? { ...t, open: false } : t
      ),
    };
  }
  listeners.forEach((l) => l(memState));
}

function toast(props: Omit<ToasterToast, "id">) {
  const id = genId();
  const update = (p: ToasterToast) => dispatch({ type: "ADD", toast: { ...p, id } });
  const dismiss = () => dispatch({ type: "DISMISS", toastId: id });

  dispatch({
    type: "ADD",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => { if (!open) dismiss(); },
    },
  });

  setTimeout(dismiss, TOAST_REMOVE_DELAY);
  setTimeout(() => dispatch({ type: "REMOVE", toastId: id }), TOAST_REMOVE_DELAY + 300);

  return { id, dismiss, update };
}

toast.success = (title: string, description?: string) =>
  toast({ title, description, variant: "success" } as ToasterToast);
toast.error = (title: string, description?: string) =>
  toast({ title, description, variant: "destructive" } as ToasterToast);
toast.warning = (title: string, description?: string) =>
  toast({ title, description, variant: "warning" } as ToasterToast);

function useToast() {
  const [state, setState] = React.useState<State>(memState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { listeners.splice(listeners.indexOf(setState), 1); };
  }, []);
  return { ...state, toast, dismiss: (id?: string) => dispatch({ type: "DISMISS", toastId: id }) };
}

export { useToast, toast };
