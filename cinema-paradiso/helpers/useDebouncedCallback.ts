import { useCallback, useEffect, useRef } from 'react'

export default function useDebouncedCallback<A extends any[]>(
  callback: (...args: A) => any,
  delay: number,
) {
  const argsRef = useRef<A>()
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    cleanup()
  }, [cleanup])

  return useCallback(
    (...args: A) => {
      argsRef.current = args

      cleanup()

      timeoutRef.current = setTimeout(() => {
        if (argsRef.current) {
          callback(...argsRef.current)
        }
      }, delay)
    },
    [callback, cleanup, delay],
  )
}
