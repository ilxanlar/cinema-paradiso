export type PlayerBufferedRangeType = {
  start: number;
  end: number;
};

export type PlayerBufferedRangesType = PlayerBufferedRangeType[];

export type CaptionType = {
  label: string;
  id: string;
  track: TextTrack;
};

export type SourceType = {
  default?: boolean;
  label: string;
  quality: number;
  src: string;
  sup?: string;
};

export type PlayerStateType = {
  buffered: PlayerBufferedRangesType;
  canPlay: boolean;
  caption?: CaptionType;
  captionLast?: CaptionType;
  captions: CaptionType[];
  duration?: number;
  error?: MediaError;
  fullscreen: boolean;
  height?: number;
  hovered: boolean;
  muted: boolean;
  paused: boolean;
  playbackRate: number;
  quality: 'auto' | number;
  showActions: boolean;
  waiting: boolean;
  width?: number;
};

export type MediaRefType = React.MutableRefObject<
  HTMLVideoElement | HTMLAudioElement | null
>;

export type PlayerApiType = {
  currentTime: (value?: number) => number | void;
  currentTimePercent: (value?: number) => number | void;
  muted: (value?: boolean) => boolean | void;
  playing: () => boolean;
  paused: () => boolean;
  volume: (value?: number) => number | void;
  fastForward: (seconds?: number) => void;
  fastRewind: (seconds?: number) => void;
  togglePlay: () => void;
  toggleMute: () => void;
  volumeDown: (percent?: number) => void;
  volumeUp: (percent?: number) => void;
  playbackRate: (value?: number) => number | void;
  requestFullscreen: () => void;
  exitFullscreen: () => void;
  toggleFullscreen: () => void;
  disableCaption: () => void;
  selectCaption: (caption: CaptionType) => void;
  selectQuality: (quality: 'auto' | number) => void;
};

export type PlayerType = {
  api: PlayerApiType;
  buffered: PlayerBufferedRangesType;
  canPlay: boolean;
  caption?: CaptionType;
  captions: CaptionType[];
  duration?: number;
  error?: MediaError;
  fullscreen: boolean;
  height?: number;
  hovered: boolean;
  muted: boolean;
  paused: boolean;
  playbackRate: number;
  props: any;
  quality: 'auto' | number;
  showActions: boolean;
  sources: SourceType[];
  waiting: boolean;
  width?: number;
  wrapperProps: any;
};
