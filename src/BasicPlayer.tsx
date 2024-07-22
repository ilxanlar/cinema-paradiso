import { Player, RenderCaption, RenderTime, Seeker, usePlayer } from '../'
import classnames from 'classnames'

import PlaySVG from '@/icons/play-filled.svg'
import PauseSVG from '@/icons/pause.svg'
import VolumeOffSVG from '@/icons/volume-off-filled.svg'
import VolumeOnSVG from '@/icons/volume-up-filled.svg'
import FullscreenExitSVG from '@/icons/fullscreen-exit.svg'
import FullscreenSVG from '@/icons/fullscreen.svg'

export default function SimplePlayer({ src }: { src: string }) {
  return (
    <Player className="bg-black w-full z-0" src={src} wrapperClassName="overflow-hidden">
      <Customize src={src} />
    </Player>
  )
}

function Customize({ src }: { src: string }) {
  const player = usePlayer()

  return (
    <>
      {player.waiting ? (
        <div
          className="bg-gray-500 text-white opacity-80 px-6 py-3 rounded-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          Loading...
        </div>
      ) : null}

      {player.error ? (
        <div
          className="bg-red-700 text-white opacity-80 px-6 py-3 rounded-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {player.error.message}
        </div>
      ) : null}

      <RenderCaption>
        {(cues) => (
          <div
            className={classnames(
              'absolute duration-300 leading-6 left-1/2 px-2 py-1 rounded-lg text-left text-lg text-white transition-all -translate-x-1/2',
              player.paused || player.showActions ? 'bottom-20' : 'bottom-2',
            )}
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              minWidth: '300px',
              maxWidth: '70%',
            }}
          >
            {cues.map((cue: string, key: number) => (
              <span key={key}>{cue}</span>
            ))}
          </div>
        )}
      </RenderCaption>

      <div
        className={classnames(
          'absolute duration-300 left-0 px-3 py-2 right-0 text-white transition-all z-20',
          player.paused || player.showActions ? 'bottom-0 opacity-100' : '-bottom-16 opacity-0',
        )}
        style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,.6), rgba(0,0,0,0))',
        }}
      >
        <div className="flex gap-4 items-center px-1">
          <button className="h-8 p-0 w-8" onClick={() => player.api.togglePlay()}>
            {player.paused ? (
              <PlaySVG className="h-8 w-8" fill="currentColor"/>
            ) : (
              <PauseSVG className="h-8 w-8" fill="currentColor"/>
            )}
          </button>

          <button className="h-8 p-1 w-8" onClick={() => player.api.toggleMute()}>
            {player.muted ? (
              <VolumeOffSVG className="h-6 w-6" fill="currentColor"/>
            ) : (
              <VolumeOnSVG className="h-6 w-6" fill="currentColor"/>
            )}
          </button>

          <div className="grow">
            <Seeker srcForPreview={src} />
          </div>

          <RenderTime>
            {({ currentTime, duration }) => (
              <span>
              <span>{currentTime}</span>
              <span>&nbsp;/&nbsp;</span>
              <span>{duration}</span>
            </span>
            )}
          </RenderTime>

          <button className="h-8 p-1 w-8" onClick={() => player.api.toggleFullscreen()}>
            {player.fullscreen ? (
              <FullscreenExitSVG className="h-6 w-6" fill="currentColor"/>
            ) : (
              <FullscreenSVG className="h-6 w-6" fill="currentColor"/>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
