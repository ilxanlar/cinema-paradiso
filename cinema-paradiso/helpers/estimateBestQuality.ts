const imageSize = 7000 //7300000;
const imageUrl =
  'https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_272x92dp.png'
// 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Bloemen_van_adderwortel_%28Persicaria_bistorta%2C_synoniem%2C_Polygonum_bistorta%29_06-06-2021._%28d.j.b%29.jpg';

export default function estimateBestQuality(): Promise<number> {
  return new Promise((resolve) => {
    const imageAddr = imageUrl + '?n=' + Math.random()
    const startTime: number = new Date().getTime()
    const img = new Image()
    img.onload = () => {
      const endTime: number = new Date().getTime()
      const duration = (endTime - startTime) / 1000 // Math.round()
      const bitsLoaded = imageSize * 8
      const speedBps = Number((bitsLoaded / duration).toFixed(2))
      const speedKbps = Number((speedBps / 1024).toFixed(2))
      const speedMbps = Number((speedKbps / 1024).toFixed(2))
      let bestQuality

      if (speedMbps <= 0.7) {
        bestQuality = 360
      } else if (speedMbps <= 1.1) {
        bestQuality = 480
      } else if (speedMbps <= 2.5) {
        bestQuality = 720
      } else if (speedMbps <= 5) {
        bestQuality = 1080
      } else {
        bestQuality = 2160
      }

      resolve(bestQuality)
    }
    img.src = imageAddr
  })
}
