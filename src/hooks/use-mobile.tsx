
import * as React from "react"

const SCREEN_BREAKPOINT_MOBILE = 768

export function useIsMobile() {
  const [isMobileDevice, setIsMobileDevice] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia(`(max-width: ${SCREEN_BREAKPOINT_MOBILE - 1}px)`)
    const handleResize = () => {
      setIsMobileDevice(window.innerWidth < SCREEN_BREAKPOINT_MOBILE)
    }
    mediaQueryList.addEventListener("change", handleResize)
    setIsMobileDevice(window.innerWidth < SCREEN_BREAKPOINT_MOBILE)
    return () => mediaQueryList.removeEventListener("change", handleResize)
  }, [])

  return !!isMobileDevice
}
