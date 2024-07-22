import { ReactNode } from 'react'
import useCurrentTime from './useCurrentTime'
import usePlayer from './usePlayer'
import { formatTime } from './helpers/utils'

type Props = {
  children: (params: {
    currentTime: string;
    duration: string;
  }) => ReactNode;
};

export default function RenderTime(props: Props) {
  const { duration } = usePlayer()
  const currentTime = useCurrentTime(500)

  return props.children({
    currentTime: currentTime >= 0 ? formatTime(currentTime) : '00:00',
    duration: typeof duration === 'number' ? formatTime(duration) : '00:00',
  })
}
