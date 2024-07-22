export function formatTime(seconds: number) {
  const totalSeconds = Math.round(seconds)
  const s = totalSeconds % 60
  const tm = (totalSeconds - s) / 60
  const m = tm % 60
  const h = (tm - m) / 60

  if (h > 0) {
    return `${format(h)}:${format(m)}:${format(s)}`
  } else {
    return `${format(m)}:${format(s)}`
  }
}

function format(number: number) {
  return number < 10 ? `0${number}` : `${number}`
}
