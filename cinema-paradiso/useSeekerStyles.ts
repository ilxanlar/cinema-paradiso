import { useMemo } from 'react'
import useDebouncedValue from './helpers/useDebouncedValue'

type ParamsType = {
  isHovered: boolean;
  isPreviewVisible: boolean;
  seekerBoxColor: string;
  seekerBufferedColor: string;
  seekerDotHeight: string;
  seekerFocusedHeight: string;
  seekerHeight: string;
  seekerProgressColor: string;
  seekerGhostProgressColor: string;
  seekerWrapperHeight: string;
};

type StylesType = {
  wrapper: React.CSSProperties;
  seeker: React.CSSProperties;
  seekerBox: React.CSSProperties;
  buffered: React.CSSProperties;
  progress: React.CSSProperties;
  progressDot: React.CSSProperties;
  ghostProgress: React.CSSProperties;
  preview: React.CSSProperties;
  previewVideo: React.CSSProperties;
  previewTime: React.CSSProperties;
};

export default function useSeekerStyles(params: ParamsType): StylesType {
  const {
    isHovered,
    seekerBoxColor,
    seekerBufferedColor,
    seekerDotHeight,
    seekerFocusedHeight,
    seekerGhostProgressColor,
    seekerHeight,
    seekerProgressColor,
    seekerWrapperHeight,
  } = params

  const isGhostTimeVisible = useDebouncedValue(isHovered, 500)

  return useMemo<StylesType>(() => {
    return {
      wrapper: {
        position: 'relative',
        userSelect: 'none',
      },
      seeker: {
        alignItems: 'center',
        cursor: 'pointer',
        display: 'flex',
        height: seekerWrapperHeight,
      },
      seekerBox: {
        backgroundColor: seekerBoxColor,
        flexGrow: 1,
        height: isHovered ? seekerFocusedHeight : seekerHeight,
        position: 'relative',
        transition: 'height 150ms ease',
        zIndex: 0,
      },
      buffered: {
        backgroundColor: seekerBufferedColor,
        height: '100%',
        position: 'absolute',
        zIndex: 2,
      },
      progress: {
        backgroundColor: seekerProgressColor,
        height: '100%',
        left: 0,
        position: 'absolute',
        zIndex: 4,
      },
      progressDot: {
        backgroundColor: seekerProgressColor,
        borderRadius: '50%',
        height: isHovered ? seekerDotHeight : seekerHeight,
        marginLeft: `calc(${seekerDotHeight} / -2)`,
        opacity: isHovered ? 1 : 0,
        position: 'absolute',
        top: isHovered
          ? `calc((${seekerDotHeight} - ${seekerFocusedHeight}) / -2)`
          : 0,
        transition:
          'height 150ms ease, opacity 150ms ease, top 150ms ease, width 150ms ease',
        width: isHovered ? seekerDotHeight : seekerHeight,
        zIndex: 4,
      },
      ghostProgress: {
        backgroundColor: seekerGhostProgressColor,
        bottom: 0,
        left: 0,
        position: 'absolute',
        top: 0,
        zIndex: 3,
      },
      preview: {
        alignItems: 'center',
        bottom: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: isHovered ? 'auto' : 0,
        overflow: 'hidden',
        position: 'absolute',
        textAlign: 'center',
        transform: 'translateX(-50%)',
        width: '10rem',
      },
      previewVideo: {
        backgroundColor: '#000',
        border: '2px solid #fff',
        borderRadius: 3,
        marginBottom: 8,
        opacity: isGhostTimeVisible ? 1 : 0,
        width: '100%',
      },
      previewTime: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 5,
        color: '#fff',
        display: 'inline-block',
        fontSize: 12,
        lineHeight: '16px',
        opacity: isGhostTimeVisible ? 1 : 0,
        padding: '0 4px',
        transition: 'opacity 300ms ease',
      },
    }
  }, [
    isGhostTimeVisible,
    isHovered,
    seekerBoxColor,
    seekerBufferedColor,
    seekerDotHeight,
    seekerFocusedHeight,
    seekerGhostProgressColor,
    seekerHeight,
    seekerProgressColor,
    seekerWrapperHeight,
  ])
}
