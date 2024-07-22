import { useEffect, useRef, useState } from 'react'

export default function useRefreshValue<T>(
  getter: Function,
  initialValue: T,
  interval: number = 100,
): T {
  const [value, setValue] = useState<T>(initialValue)

  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setValue(getter())
    }, interval)

    return () => {
      if (typeof intervalRef.current === 'number') {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [interval, getter])

  return value
}
