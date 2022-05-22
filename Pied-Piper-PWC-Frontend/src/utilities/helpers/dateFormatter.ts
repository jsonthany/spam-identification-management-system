export default function dateFormatter(data : string) : string {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new Date(data);
  return Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: userTimeZone,
  }).format(date);
}
