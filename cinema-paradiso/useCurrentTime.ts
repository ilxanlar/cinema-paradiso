import { useCallback } from 'react'
import usePlayer from './usePlayer'
import useRefreshValue from './helpers/useRefreshValue'

export default function useCurrentTime(interval: number = 100) {
  const { api } = usePlayer()

  const getCurrentTime = useCallback(() => {
    if (api) {
      return api.currentTime()
    }
    return 0
  }, [api])

  return useRefreshValue<number>(getCurrentTime, 0, interval)
}
