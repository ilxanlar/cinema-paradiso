import { createContext } from 'react'
import { PlayerType } from './types'
import createPlayerApi from './createPlayerApi'

export default createContext<PlayerType>({
  api: createPlayerApi({
    current: null,
  }),
  buffered: [],
  canPlay: false,
  captions: [],
  fullscreen: false,
  hovered: false,
  muted: false,
  paused: false,
  playbackRate: 1,
  props: {},
  quality: 'auto',
  sources: [],
  showActions: false,
  waiting: false,
  wrapperProps: {},
})
