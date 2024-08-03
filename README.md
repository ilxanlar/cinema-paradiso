# Cinema Paradiso

Cinema Paradiso is one of the best movies out there, directed by Giuseppe Tornatore. Don't forget to watch it if you haven't yet.

Other than the great movie, Cinema Paradiso is a video player built on top of React.

### Getting Started

Install it:

```bash
npm i cinema-paradiso
```

Then use it:

```tsx
import { Player, RenderTime } from 'cinema-paradiso'

function Example() {
  return (
    <Player src="...">
      {(player) => (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button onClick={() => player.api.togglePlay()}>
            {player.paused ? 'Play' : 'Pause'}
          </button>
          <button onClick={() => player.api.toggleMute()}>
            {player.muted ? 'Mute' : 'Unmute'}
          </button>
          ...
          <RenderTime>
            {({ currentTime, duration }) => (
              <span>{currentTime} / {duration}</span>
            )}
          </RenderTime>
          <button onClick={() => player.api.toggleFullscreen()}>
            {player.fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      )}
    </Player>
  )
}
```

### Documentation

Coming soon...
