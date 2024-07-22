import { FocusEvent, MouseEvent, TouchEvent, useCallback, useLayoutEffect, useRef, useState } from 'react'
import usePlayer from './usePlayer'
import useSeekerStyles from './useSeekerStyles'
import useRefreshValue from './helpers/useRefreshValue'
import { formatTime } from './helpers/utils'

export type SeekerProps = {
  minPreviewLeftPx?: number;
  minPreviewRightPx?: number;
  onBlur?: () => void;
  onFocus?: () => void;
  onSeekStart?: (next: number) => void;
  onSeeking?: (next: number) => void;
  onSeekEnd?: (next: number) => void;
  seekerBoxColor?: string;
  seekerBufferedColor?: string;
  seekerDotHeight?: string;
  seekerFocusedHeight?: string;
  seekerHeight?: string;
  seekerProgressColor?: string;
  seekerGhostProgressColor?: string;
  seekerWrapperHeight?: string;
  srcForPreview?: string;
};

export default function Seeker(props: SeekerProps) {
  const {
    minPreviewLeftPx = 0,
    minPreviewRightPx = 0,
    onBlur,
    onFocus,
    onSeeking,
    onSeekStart,
    onSeekEnd,
    seekerBoxColor = 'rgba(255, 255, 255, 0.25)',
    seekerBufferedColor = 'rgba(255, 255, 255, 0.5)',
    seekerDotHeight = '15px',
    seekerFocusedHeight = '5px',
    seekerGhostProgressColor = 'rgba(255, 255, 255, 0.5)',
    seekerHeight = '3px',
    seekerProgressColor = 'rgb(255, 71, 87)',
    seekerWrapperHeight = '20px',
    srcForPreview,
  } = props

  const player = usePlayer()

  const videoAPI = player.api
  const buffered = player.buffered || []
  const duration = player.duration

  const [isHovered, setIsHovered] = useState(false)
  const [isPreviewReady, setIsPreviewReady] = useState(false)
  const [ghostTime, setGhostTime] = useState<number>(-1)
  const [seekingTime, setSeekingTime] = useState<number>(-1)

  const getCurrentTime = useCallback(() => {
    if (videoAPI) {
      return videoAPI.currentTime()
    }
    return 0
  }, [])

  const currentTime = useRefreshValue<number>(getCurrentTime, 0)

  // const singleBuffered = buffered.find((item) => item.start < currentTime && item.end > currentTime)

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const ghostRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLSpanElement | null>(null)
  const previewWrapperRef = useRef<HTMLDivElement | null>(null)
  const previewVideoRef = useRef<HTMLVideoElement | null>(null)
  const isSeekingRef = useRef(false)
  const isSeekingViaMouseRef = useRef(false)
  const rangeRef = useRef({
    end: -1,
    start: -1,
  })

  const canRender = typeof duration === 'number' && duration > 0

  useLayoutEffect(() => {
    if (!isSeekingRef.current && seekingTime !== -1) {
      setSeekingTime(-1)
    }
  }, [currentTime, seekingTime])

  useLayoutEffect(() => {
    if (!wrapperRef.current || !previewWrapperRef.current) {
      return
    }

    if (typeof duration === 'number') {
      if (ghostTime >= 0) {
        if (previewVideoRef.current) {
          previewVideoRef.current.currentTime = ghostTime
        }

        const wrapperWidth = wrapperRef.current.offsetWidth
        const previewWidth = previewWrapperRef.current.offsetWidth
        const left = (wrapperWidth * ghostTime) / duration

        if (previewWidth / 2 - left > minPreviewLeftPx) {
          previewWrapperRef.current.style.left = `${
            previewWidth / 2 - minPreviewLeftPx
          }px`
        } else if (previewWidth / 2 - wrapperWidth + left > minPreviewRightPx) {
          previewWrapperRef.current.style.left = `${
            wrapperWidth - previewWidth / 2 + minPreviewRightPx
          }px`
        } else {
          previewWrapperRef.current.style.left = `${
            (100 * ghostTime) / duration
          }%`
        }
      }
    }
  }, [duration, ghostTime, minPreviewLeftPx, minPreviewRightPx])

  useLayoutEffect(() => {
    setIsPreviewReady(false)
  }, [srcForPreview])

  const isPreviewVisible = ghostTime >= 0 && isPreviewReady

  const styles = useSeekerStyles({
    isHovered,
    isPreviewVisible,
    seekerBoxColor,
    seekerBufferedColor,
    seekerDotHeight,
    seekerFocusedHeight,
    seekerGhostProgressColor,
    seekerHeight,
    seekerProgressColor,
    seekerWrapperHeight,
  })

  if (!canRender) {
    return null
  }

  const finalTime = seekingTime >= 0 ? seekingTime : currentTime
  const progress = (finalTime / duration) * 100

  const getNextTimeByMouse = (event: MouseEvent) => {
    const { pageX } = event
    const { end, start } = rangeRef.current

    return duration * Math.max(Math.min((pageX - start) / (end - start), 1), 0)
  }

  const getNextTimeByTouch = (event: TouchEvent) => {
    const { pageX } = event.changedTouches[0]
    const { end, start } = rangeRef.current

    return duration * Math.max(Math.min((pageX - start) / (end - start), 1), 0)
  }

  const handleMouseEnter = (_event: MouseEvent) => {
    if (!wrapperRef.current) {
      return
    }

    const { left, width } = wrapperRef.current.getBoundingClientRect()

    rangeRef.current.start = left
    rangeRef.current.end = left + width

    setIsHovered(true)
  }

  const handleMouseLeave = (event: MouseEvent) => {
    if (isSeekingRef.current) {
      const next = getNextTimeByMouse(event)

      videoAPI.currentTime(next)

      if (onSeekEnd) {
        onSeekEnd(next)
      }

      isSeekingRef.current = false
      isSeekingViaMouseRef.current = false
    } else {
      setGhostTime(-1)
    }

    setIsHovered(false)
  }

  const handleMouseDown = (event: MouseEvent) => {
    isSeekingRef.current = true
    isSeekingViaMouseRef.current = true

    const next = getNextTimeByMouse(event)

    setSeekingTime(next)

    videoAPI.currentTime(next)

    if (onSeekStart) {
      onSeekStart(next)
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    const next = getNextTimeByMouse(event)

    setGhostTime(next)

    if (!isSeekingViaMouseRef.current) {
      return
    }

    setSeekingTime(next)

    videoAPI.currentTime(next)

    if (onSeeking) {
      onSeeking(next)
    }
  }

  const handleMouseUp = (event: MouseEvent) => {
    const next = getNextTimeByMouse(event)

    videoAPI.currentTime(next)

    if (onSeekEnd) {
      onSeekEnd(next)
    }

    isSeekingRef.current = false
    isSeekingViaMouseRef.current = false
  }

  const handleTouchStart = (event: TouchEvent) => {
    if (!wrapperRef.current) {
      return
    }

    isSeekingRef.current = true

    const { left, width } = wrapperRef.current.getBoundingClientRect()

    rangeRef.current.start = left
    rangeRef.current.end = left + width

    const next = getNextTimeByTouch(event)

    setSeekingTime(next)

    videoAPI.currentTime(next)

    if (onSeekStart) {
      onSeekStart(next)
    }
  }

  const handleTouchMove = (event: TouchEvent) => {
    const next = getNextTimeByTouch(event)

    setSeekingTime(next)

    videoAPI.currentTime(next)

    if (onSeeking) {
      onSeeking(next)
    }
  }

  const handleTouchEnd = (event: TouchEvent) => {
    const next = getNextTimeByTouch(event)

    videoAPI.currentTime(next)

    if (onSeekEnd) {
      onSeekEnd(next)
    }

    isSeekingRef.current = false
  }

  const handleBlurMain = () => {
    if (typeof onBlur === 'function') {
      onBlur()
    }
  }

  const handleFocusMain = (_event: FocusEvent) => {
    if (typeof onFocus === 'function') {
      onFocus()
    }
  }

  return (
    <div style={styles.wrapper}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={wrapperRef}
        style={styles.seeker}
      >
        <div
          onBlur={handleBlurMain}
          onFocus={handleFocusMain}
          style={styles.seekerBox}
        >
          {buffered.map((item, key) => (
            <div
              key={key}
              style={{
                ...styles.buffered,
                left: `${(100 * item.end) / duration}%`,
                right: `${100 - (100 * item.end) / duration}%`,
              }}
            />
          ))}

          <div
            ref={ghostRef}
            style={{
              ...styles.ghostProgress,
              width: ghostTime >= 0 ? `${(100 * ghostTime) / duration}%` : 0,
            }}
          />

          <div
            ref={progressRef}
            style={{
              ...styles.progress,
              width: `${progress}%`,
            }}
          />

          <span
            className="player-seeker-dot"
            ref={dotRef}
            style={{
              ...styles.progressDot,
              left: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div ref={previewWrapperRef} style={styles.preview}>
        {srcForPreview ? (
          <video
            autoPlay={false}
            controls={false}
            loop={false}
            onLoadedData={() => {
              if (previewVideoRef.current?.readyState === 4) {
                setIsPreviewReady(true)
              }
            }}
            playsInline={false}
            ref={previewVideoRef}
            src={srcForPreview}
            style={styles.previewVideo}
          />
        ) : null}

        {ghostTime >= 0 ? (
          <span style={styles.previewTime}>{formatTime(ghostTime)}</span>
        ) : null}
      </div>
    </div>
  )
}
