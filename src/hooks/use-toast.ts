
"use client"

import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const MAX_TOASTS = 1
const TOAST_AUTO_CLOSE_DELAY = 1000000

type ToastMessage = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const toastActions = {
  ADD: "ADD_TOAST",
  UPDATE: "UPDATE_TOAST",
  DISMISS: "DISMISS_TOAST",
  REMOVE: "REMOVE_TOAST",
} as const

let toastCounter = 0

function generateToastId() {
  toastCounter = (toastCounter + 1) % Number.MAX_SAFE_INTEGER
  return toastCounter.toString()
}

type ToastActionTypes = typeof toastActions

type ToastReducerAction =
  | {
      type: ToastActionTypes["ADD"]
      toast: ToastMessage
    }
  | {
      type: ToastActionTypes["UPDATE"]
      toast: Partial<ToastMessage>
    }
  | {
      type: ToastActionTypes["DISMISS"]
      toastId?: ToastMessage["id"]
    }
  | {
      type: ToastActionTypes["REMOVE"]
      toastId?: ToastMessage["id"]
    }

interface ToastState {
  toasts: ToastMessage[]
}

const activeToastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const scheduleToastRemoval = (toastId: string) => {
  if (activeToastTimeouts.has(toastId)) {
    return
  }

  const removalTimeout = setTimeout(() => {
    activeToastTimeouts.delete(toastId)
    dispatchToastAction({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_AUTO_CLOSE_DELAY)

  activeToastTimeouts.set(toastId, removalTimeout)
}

export const toastReducer = (state: ToastState, action: ToastReducerAction): ToastState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, MAX_TOASTS),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        scheduleToastRemoval(toastId)
      } else {
        state.toasts.forEach((toastItem) => {
          scheduleToastRemoval(toastItem.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const toastListeners: Array<(state: ToastState) => void> = []

let currentToastState: ToastState = { toasts: [] }

function dispatchToastAction(action: ToastReducerAction) {
  currentToastState = toastReducer(currentToastState, action)
  toastListeners.forEach((listenerFunc) => {
    listenerFunc(currentToastState)
  })
}

type NewToastProps = Omit<ToastMessage, "id">

function showToast({ ...props }: NewToastProps) {
  const newToastId = generateToastId()

  const updateToast = (updatedProps: ToastMessage) =>
    dispatchToastAction({
      type: "UPDATE_TOAST",
      toast: { ...updatedProps, id: newToastId },
    })
  const dismissToast = () => dispatchToastAction({ type: "DISMISS_TOAST", toastId: newToastId })

  dispatchToastAction({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id: newToastId,
      open: true,
      onOpenChange: (isOpen) => {
        if (!isOpen) dismissToast()
      },
    },
  })

  return {
    id: newToastId,
    dismiss: dismissToast,
    update: updateToast,
  }
}

function useToast() {
  const [toastState, setToastState] = React.useState<ToastState>(currentToastState)

  React.useEffect(() => {
    toastListeners.push(setToastState)
    return () => {
      const listenerIndex = toastListeners.indexOf(setToastState)
      if (listenerIndex > -1) {
        toastListeners.splice(listenerIndex, 1)
      }
    }
  }, [toastState])

  return {
    ...toastState,
    toast: showToast,
    dismiss: (toastId?: string) => dispatchToastAction({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, showToast as toast }
