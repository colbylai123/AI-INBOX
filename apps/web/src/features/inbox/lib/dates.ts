const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (n: number) => String(n).padStart(2, '0')
const clock = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

/** For a list row: the time for today's mail ("23:14"), the day otherwise ("Oct 25"). */
export function listTime(iso: string, now = new Date()) {
  const date = new Date(iso)
  if (date.toDateString() === now.toDateString()) return clock(date)
  const day = `${months[date.getMonth()]} ${date.getDate()}`
  return date.getFullYear() === now.getFullYear() ? day : `${day}, ${date.getFullYear()}`
}

/** The full date and time, as on an open email: "Oct 25, 2024 23:14". */
export function fullDate(iso: string) {
  const date = new Date(iso)
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${clock(date)}`
}
