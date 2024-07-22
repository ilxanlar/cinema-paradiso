import { useContext } from 'react'
import PlayerContext from './context'
import type { PlayerType } from './types'

export default function usePlayer(): PlayerType {
  return useContext(PlayerContext)
}
