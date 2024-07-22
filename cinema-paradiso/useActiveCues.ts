import { useLayoutEffect, useState } from 'react'
import usePlayer from './usePlayer'

export default function useActiveCues(): string[] {
  const [cues, setCues] = useState<string[]>([])

  const { caption } = usePlayer()

  useLayoutEffect(() => {
    setCues([])

    if (!caption) {
      return
    }

    const updateCues = () => {
      const nextCues = []
      if (caption.track.activeCues) {
        for (let i = 0; i < caption.track.activeCues.length; i++) {
          const cue = caption.track.activeCues[i] as any
          nextCues.push(cue.text)
        }
      }
      setCues(nextCues)
    }

    updateCues()

    caption.track.addEventListener('cuechange', updateCues)

    return () => {
      if (caption) {
        caption.track.removeEventListener('cuechange', updateCues)
      }
    }
  }, [caption])

  return cues
}
