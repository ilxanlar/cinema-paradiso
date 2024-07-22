import { useEffect, useRef, useState } from 'react'

export default function useDebouncedValue(value: any, delay: number) {
  const [dValue, setDValue] = useState<any>(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDValue(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [delay, value])

  return dValue
}
