import BasicPlayer from './BasicPlayer'

export default function App() {
  return (
    <div className="p-4">
       <BasicPlayer
         src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
       />
    </div>
  )
}
