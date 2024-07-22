import { ReactNode } from 'react'
import { PlayerType } from './types'
import useCaptionActiveCues from './useActiveCues'
import usePlayer from './usePlayer'

type Props = {
  children: (cues: string[], player: PlayerType) => ReactNode;
};

export default function RenderCaption(props: Props) {
  const cues = useCaptionActiveCues()
  const player = usePlayer()

  if (cues.length === 0) {
    return null
  }

  return props.children(cues, player)
}
