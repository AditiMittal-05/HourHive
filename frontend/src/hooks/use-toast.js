import * as React from "react";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 4000;

let count = 0;
const genId = () => `toast-${++count}`;
let memState = { toasts: [] };
const listeners = [];

function dispatch(action) {
  if (action.type === "ADD") {
    memState = { toasts: [action.toast, ...memState.toasts].slice(0, TOAST_LIMIT) };
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

function toast(props) {
  const id = genId();
  const update = (p) => dispatch({ type: "ADD", toast: { ...p, id } });
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

toast.success = (title, description) =>
  toast({ title, description, variant: "success" });
toast.error = (title, description) =>
  toast({ title, description, variant: "destructive" });
toast.warning = (title, description) =>
  toast({ title, description, variant: "warning" });

function useToast() {
  const [state, setState] = React.useState(memState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { listeners.splice(listeners.indexOf(setState), 1); };
  }, []);
  return { ...state, toast, dismiss: (id) => dispatch({ type: "DISMISS", toastId: id }) };
}

export { useToast, toast };
