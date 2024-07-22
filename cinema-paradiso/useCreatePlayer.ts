import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type {
  MediaRefType,
  PlayerBufferedRangesType,
  PlayerStateType,
  PlayerApiType,
  PlayerType,
  SourceType,
} from './types'
import createPlayerApi from './createPlayerApi'
import estimateBestQuality from './helpers/estimateBestQuality'
import useDebouncedCallback from './helpers/useDebouncedCallback'

type UsePlayerParams = {
  actionsVisibilityDebounce?: 2000;
  autoPlay: boolean;
  defaultCurrentTime?: number;
  defaultPlaybackRate?: number;
  fullscreenRef?: React.RefObject<HTMLElement>;
  onFullscreenChange?: (fullscreen: boolean) => void;
  sources?: SourceType[];
  src?: string;
};

export default function useCreatePlayer<TMedia extends HTMLMediaElement>(
  params: UsePlayerParams,
): PlayerType {
  const {
    actionsVisibilityDebounce,
    autoPlay,
    defaultCurrentTime,
    defaultPlaybackRate,
    fullscreenRef,
    onFullscreenChange,
    sources,
    src,
  } = params

  /**
   * Media Ref
   * Main media node ref
   */

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const mediaRef = useRef<TMedia | null>(null)

  /**
   * Player State
   * Define player state and its initial value
   */

  const getInitialState = useCallback<() => PlayerStateType>(
    () => ({
      buffered: [],
      canPlay: false,
      captions: [],
      fullscreen: false,
      hovered: false,
      muted: false,
      paused: !autoPlay,
      playbackRate: 1,
      quality: 'auto',
      showActions: false,
      waiting: false,
    }),
    [autoPlay],
  )

  const [state, setState] = useState<PlayerStateType>(getInitialState)

  /**
   * Player API
   */

  const api = useMemo<PlayerApiType>(
    () =>
      createPlayerApi(mediaRef, {
        fullscreenRef,
        wrapperRef,
        onSelectQuality: (quality: 'auto' | number) => {
          setState(
            (prev): PlayerStateType => ({
              ...prev,
              quality,
            }),
          )
        },
      }),
    [],
  )

  /**
   * Listen for fullscreen events
   */

  useEffect(() => {
    const listener = () => {
      const nextFullscreen = document.fullscreenElement !== null

      setState((prev: PlayerStateType) => ({
        ...prev,
        fullscreen: nextFullscreen,
      }))

      if (typeof onFullscreenChange === 'function') {
        onFullscreenChange(nextFullscreen)
      }
    }

    document.addEventListener(
      'fullscreenchange',
      listener,
    )

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        listener,
      )
    }
  })

  /**
   * Hide action debounced
   */

  const hideActionsDebounced = useDebouncedCallback(() => {
    setState((prev: PlayerStateType) => ({
      ...prev,
      showActions: false,
    }))
  }, actionsVisibilityDebounce || 3000)

  /**
   * Autoplay
   * Handle autoplay functionality
   */

  useLayoutEffect(() => {
    const media = mediaRef.current

    if (!media || media.error) {
      return
    }

    if (autoPlay) {
      media.play().catch(() => {
        media.muted = true
        media.play().catch((error) => {
          console.log('PLAYER >> ', error)
        })
      })
    } else {
      media.pause()
      media.muted = false
    }
  }, [autoPlay, mediaRef, sources, src])

  // Reset state if media source is changed

  useLayoutEffect(() => {
    setState(
      (prev): PlayerStateType => ({
        ...prev,
        buffered: [],
        error: undefined,
        quality: 'auto',
      }),
    )
  }, [sources, src])

  /**
   * Captions
   */

  // Set default text track to the state

  useEffect(() => {
    const tracks = getTextTracksByMode(mediaRef, 'showing')

    setState(
      (prev): PlayerStateType => ({
        ...prev,
        caption: tracks[0] ? normalizeTextTrack(tracks[0]) : undefined,
        captionLast: undefined,
      }),
    )
  }, [sources, src])

  // Handle change event

  useEffect(() => {
    if (!mediaRef?.current) {
      return
    }

    const listener = () => {
      getTextTracksByMode(mediaRef, 'showing').forEach((track) => {
        if (track.mode === 'showing') {
          track.mode = 'hidden'
        }
      })

      const track = getTextTracksByMode(mediaRef, 'hidden')[0]

      setState((prev) => ({
        ...prev,
        captionLast:
          track !== prev.caption?.track ? prev.caption : prev.captionLast,
        caption: prev.captions.find((cap) => cap.track === track),
      }))
    }

    mediaRef.current.textTracks.addEventListener('change', listener)

    return () => {
      if (mediaRef.current && mediaRef.current.textTracks) {
        mediaRef.current.textTracks.removeEventListener('change', listener)
      }
    }
  }, [])

  // Handle addtrack event

  useEffect(() => {
    if (!mediaRef?.current) {
      return
    }

    const listener = (event: TrackEvent) => {
      if (event.track) {
        const track: TextTrack = event.track

        setState((prev): PlayerStateType => {
          const nextCaptions = prev.captions.some(
            (caption) => caption.track === track,
          )
            ? prev.captions
            : [...prev.captions, normalizeTextTrack(track)]

          let nextCaption = prev.caption

          if (
            prev.caption &&
            nextCaptions.some((cap) => cap.track.mode === 'hidden')
          ) {
            nextCaption = nextCaptions.find(
              (cap) => cap.track.mode === 'hidden',
            )
          }

          return {
            ...prev,
            caption: nextCaption,
            captions: nextCaptions,
          }
        })
      }
    }

    mediaRef.current.textTracks.addEventListener('addtrack', listener)

    return () => {
      if (mediaRef.current && mediaRef.current.textTracks) {
        mediaRef.current.textTracks.removeEventListener('addtrack', listener)
      }
    }
  }, [])

  // Handle removetrack event

  useEffect(() => {
    if (!mediaRef?.current) {
      return
    }

    const listener = ({ track }: TrackEvent) => {
      if (track) {
        setState((prev) => ({
          ...prev,
          caption: track !== prev.caption?.track ? prev.caption : undefined,
          captions: prev.captions.filter((caption) => caption.track !== track),
        }))
      }
    }

    mediaRef.current.textTracks.addEventListener('removetrack', listener)

    return () => {
      if (mediaRef.current && mediaRef.current.textTracks) {
        mediaRef.current.textTracks.removeEventListener(
          'removetrack',
          listener,
        )
      }
    }
  }, [])

  /**
   * Auto quality
   */

  useEffect(() => {
    if (state.quality === 'auto') {
      estimateBestQuality().then((q) => {
        const reliableSources = sources?.filter(
          (source) => source.quality <= q,
        )
        if (reliableSources && reliableSources.length > 0) {
          api.selectQuality(reliableSources[0].quality)
        }
      })
    }
  }, [api, state.quality, sources])

  /**
   * Return object
   */

  return {
    // Player Public API
    api: api,

    // Player State
    buffered: state.buffered,
    canPlay: state.canPlay,
    caption: state.caption,
    captions: state.captions,
    duration: state.duration,
    error: state.error,
    fullscreen: state.fullscreen,
    height: state.height,
    muted: state.muted,
    paused: state.paused,
    playbackRate: state.playbackRate,
    quality: state.quality,
    sources: sources || [],
    waiting: state.waiting,
    width: state.width,
    hovered: state.hovered,
    showActions: state.showActions,

    // Media props
    props: {
      autoPlay: false,
      controls: false,
      ref: mediaRef,
      src: src,

      onCanPlay: () => {
        setState(
          (prev): PlayerStateType => ({
            ...prev,
            canPlay: true,
            waiting: false,
          }),
        )
      },

      onEnded: () => {
        // player.currentTime(0);
      },

      onError: () => {
        setState(
          (prev): PlayerStateType => ({
            ...prev,
            error: mediaRef?.current?.error || undefined,
          }),
        )
      },

      onLoadedMetadata: () => {
        const media = mediaRef.current

        if (!media) {
          return
        }

        if (typeof defaultCurrentTime === 'number') {
          api.currentTime(defaultCurrentTime)
        }

        if (typeof defaultPlaybackRate === 'number') {
          api.playbackRate(defaultPlaybackRate)
        }

        setState((prev): PlayerStateType => {
          const nextState = {
            ...prev,
            duration: media.duration,
          }

          if (media instanceof HTMLVideoElement) {
            nextState.height = media.videoHeight
            nextState.width = media.videoWidth
          }

          return nextState
        })
      },

      onLoad: () => {
      },

      onLoadStart: () => {
      },

      onPlay: () => {
        setState(
          (prev): PlayerStateType => ({
            ...prev,
            paused: !!mediaRef.current?.paused,
          }),
        )
      },

      onPause: () => {
        setState(
          (prev): PlayerStateType => ({
            ...prev,
            paused: !!mediaRef.current?.paused,
          }),
        )
      },

      onProgress: () => {
        const ranges: PlayerBufferedRangesType = []
        const buffered = mediaRef.current?.buffered

        if (buffered && buffered.length > 0) {
          for (let i = 0; i < buffered.length; i++) {
            ranges.push({
              start: buffered.start(i),
              end: buffered.end(i),
            })
          }
        }

        setState((prev) => ({
          ...prev,
          buffered: ranges,
        }))
      },

      onRateChange: () => {
        setState(
          (prev): PlayerStateType => ({
            ...prev,
            playbackRate: mediaRef.current?.playbackRate || 1,
          }),
        )
      },

      onVolumeChange: () => {
        setState(
          (prev): PlayerStateType => ({
            ...prev,
            muted: !!mediaRef.current?.muted,
          }),
        )
      },

      onWaiting: () => {
        setState(
          (prev): PlayerStateType => ({
            ...prev,
            waiting: true,
          }),
        )
      },
    },

    wrapperProps: {
      ref: wrapperRef,
      onMouseEnter: () => {
        setState((prev) => ({
          ...prev,
          hovered: true,
          showActions: true,
        }))
      },
      onMouseMove: () => {
        if (state.showActions === false) {
          setState((prev) => ({
            ...prev,
            showActions: true,
          }))
        }
        hideActionsDebounced()
      },
      onMouseLeave: () => {
        setState((prev) => ({
          ...prev,
          hovered: false,
          showActions: true,
        }))
      },
    },
  }
}

function normalizeTextTrack(textTrack: TextTrack) {
  return {
    id: textTrack.id,
    kind: textTrack.kind,
    label: textTrack.label,
    language: textTrack.language,
    track: textTrack,
  }
}

function getTextTracksByMode(
  ref: MediaRefType,
  mode: TextTrackMode,
): TextTrack[] {
  const textTracks = ref?.current?.textTracks

  let tracks: TextTrack[] = []

  if (textTracks && textTracks.length > 0) {
    for (let i = 0; i < textTracks.length; i++) {
      if (textTracks[i].mode === mode) {
        tracks.push(textTracks[i])
      }
    }
  }

  return tracks
}
