import { RefObject } from 'react'
import { MediaRefType, CaptionType } from './types'

type Options = {
  fullscreenRef?: RefObject<HTMLElement>;
  wrapperRef?: RefObject<HTMLDivElement>;
  onSelectQuality?: (quality: 'auto' | number) => void;
};

export default function createPlayerApi(
  mediaRef: MediaRefType,
  options?: Options,
) {
  return {
    currentTime(value?: number): number | void {
      if (typeof value === 'number') {
        if (mediaRef?.current) {
          mediaRef.current.currentTime = value
        }
      } else {
        return mediaRef?.current?.currentTime || 0
      }
    },

    currentTimePercent(value?: number): number | void {
      if (typeof value === 'number') {
        if (value < 0 || value > 100) {
          throw new Error('Not a valid percent value: must be from 0 to 100.')
        }
        if (mediaRef?.current) {
          if (typeof mediaRef.current.duration === 'number') {
            mediaRef.current.currentTime =
              (mediaRef.current.duration * value) / 100
          }
        }
      } else {
        if (mediaRef?.current) {
          if (typeof mediaRef.current.duration === 'number') {
            const time = mediaRef.current.currentTime || 0
            return (100 * time) / mediaRef.current.duration
          }
        }
      }
    },

    muted(value?: boolean): boolean | void {
      if (typeof value === 'boolean') {
        if (mediaRef?.current) {
          mediaRef.current.muted = value
        }
      } else {
        return !!mediaRef?.current?.muted
      }
    },

    playing(): boolean {
      if (!mediaRef?.current) {
        return false
      }
      return (
        mediaRef.current.currentTime > 0 &&
        !mediaRef.current.paused &&
        !mediaRef.current.ended &&
        mediaRef.current.readyState > mediaRef.current.HAVE_CURRENT_DATA
      )
    },

    paused(): boolean {
      return !this.playing()
      // return !!mediaRef?.current?.paused;
    },

    volume(value?: number): number | void {
      if (typeof value === 'number') {
        if (mediaRef?.current) {
          mediaRef.current.volume = value
        }
      } else {
        return mediaRef?.current?.volume
      }
    },

    fastForward(seconds = 5): void {
      this.currentTime((this.currentTime() || 0) + seconds)
    },

    fastRewind(seconds = 5): void {
      if (mediaRef?.current) {
        mediaRef.current.currentTime -= seconds
      }
    },

    togglePlay(): void {
      if (mediaRef?.current) {
        if (this.playing()) {
          mediaRef.current.pause()
        } else {
          mediaRef.current.play().catch((error: Error) => {
            console.log('PLAYER >> ', error)
          })
        }
      }
    },

    toggleMute(): void {
      this.muted(!this.muted())
    },

    volumeDown(percent = 5): void {
      if (mediaRef?.current) {
        mediaRef.current.volume = Math.max(
          mediaRef.current.volume - percent / 100,
          0,
        )
      }
    },

    volumeUp(percent = 5): void {
      if (mediaRef?.current) {
        mediaRef.current.volume = Math.min(
          mediaRef.current.volume + percent / 100,
          1,
        )
      }
    },

    playbackRate(value?: number): number | void {
      if (typeof value === 'number') {
        if (mediaRef?.current) {
          mediaRef.current.playbackRate = value
        }
      } else {
        return mediaRef?.current?.playbackRate || 1
      }
    },

    requestFullscreen() {
      if (options?.fullscreenRef?.current) {
        options.fullscreenRef.current.requestFullscreen()
      } else if (options?.wrapperRef?.current) {
        options.wrapperRef.current.requestFullscreen()
      }
    },

    exitFullscreen() {
      document?.exitFullscreen()
    },

    toggleFullscreen() {
      if (document.fullscreenElement) {
        this.exitFullscreen()
      } else {
        this.requestFullscreen()
      }
    },

    disableCaption() {
      const textTracks = mediaRef?.current?.textTracks

      if (textTracks && textTracks.length > 0) {
        for (let i = 0; i < textTracks.length; i++) {
          textTracks[i].mode = 'disabled'
        }
      }
    },

    selectCaption(caption: CaptionType): void {
      const textTracks = mediaRef?.current?.textTracks

      if (textTracks && textTracks.length > 0) {
        for (let i = 0; i < textTracks.length; i++) {
          if (caption.track === textTracks[i]) {
            textTracks[i].mode = 'hidden'
          } else {
            textTracks[i].mode = 'disabled'
          }
        }
      }
    },

    selectQuality(quality: 'auto' | number, notifyListeners = true) {
      if (!mediaRef?.current) {
        return
      }

      const sources = mediaRef.current.getElementsByTagName('source')

      if (sources) {
        let source

        for (let i = 0; i < sources.length; i++) {
          if (Number(sources[i].dataset.quality) === quality) {
            source = sources[i]
            break
          }
        }

        if (source) {
          const time = this.currentTime() as number
          const wasPlaying = this.playing()
          if (wasPlaying) {
            mediaRef.current.pause()
          }
          source.remove()
          mediaRef.current.prepend(source)
          mediaRef.current.load()
          this.currentTime(time)
          if (wasPlaying && !this.playing()) {
            this.togglePlay()
          }

          if (notifyListeners && options?.onSelectQuality) {
            options.onSelectQuality(quality)
          }
        }
      }
    },
  }
}
