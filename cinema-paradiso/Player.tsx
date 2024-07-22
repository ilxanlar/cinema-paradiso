import { ComponentPropsWithoutRef, memo, RefObject, useMemo, useRef } from 'react'
import useCreatePlayer from './useCreatePlayer'
import Context from './context'

type Caption = {
  default?: boolean
  label: string
  src: string
  srcLang?: string
}

type Source = {
  label: string
  quality: number
  src: string
}

export type PlayerProps = ComponentPropsWithoutRef<'video'> & {
  captions?: Caption[]
  defaultCurrentTime?: number
  defaultPlaybackRate?: number
  fullscreenRef?: RefObject<HTMLElement>
  onFullscreenChange?: (fullscreen: boolean) => void
  sources?: Source[]
  src?: string
  wrapperClassName?: string
}

function Player<TMedia extends HTMLMediaElement>(props: PlayerProps) {
  const {
    captions,
    children,
    defaultCurrentTime,
    defaultPlaybackRate,
    fullscreenRef,
    onFullscreenChange,
    sources: unorderedSources,
    src,
    wrapperClassName,
    ...rest
  } = props

  const videoKeyRef = useRef(0)

  const sources = useMemo(() => {
    if (!unorderedSources) {
      return unorderedSources
    }

    const nextSources = [...unorderedSources]

    nextSources.sort((sourceA, sourceB) => sourceB.quality - sourceA.quality)

    return nextSources
  }, [unorderedSources])

  const player = useCreatePlayer<TMedia>({
    autoPlay: true,
    defaultCurrentTime,
    defaultPlaybackRate,
    // fullscreenRef,
    onFullscreenChange,
    sources,
    src,
  })

  const videoKey = useMemo(() => ++videoKeyRef.current, [sources, src])

  return (
    <Context.Provider value={player}>
      <>
        <div style={{ position: 'relative' }}>
          <div
            className={wrapperClassName}
            {...player.wrapperProps}
            style={{
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <video
              key={videoKey}
              {...rest}
              {...player.props}
              style={{
                aspectRatio: player.height && player.width ? player.width / player.height : 16 / 9,
                height: '100%',
              }}
            >
              {captions && captions.length > 0 ? (
                <>
                  {captions.map((caption: Caption, key: number) => (
                    <track
                      default={caption.default}
                      key={`${src}-${key}`}
                      label={caption.label}
                      kind="captions"
                      src={caption.src}
                      srcLang={caption.srcLang}
                    />
                  ))}
                </>
              ) : null}

              {sources && sources.length > 0 ? (
                <>
                  {sources.map((source: Source, key: number) => (
                    <source
                      key={key}
                      data-label={source.label}
                      data-quality={source.quality}
                      src={source.src}
                    />
                  ))}
                </>
              ) : (
                <source src={src}/>
              )}
            </video>

            {children}
          </div>
        </div>
      </>
    </Context.Provider>
  )
}

export default memo(Player)
