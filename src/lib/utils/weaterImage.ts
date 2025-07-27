// 날씨 description 바탕으로 배경 이미지 반환
export function weatherImage(description: string): string {
  const lower = description.toLowerCase();

  if (lower.includes('clear')) return 'clear';
  if (lower.includes('cloud')) return 'cloud';
  if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower')) return 'rain';
  if (lower.includes('snow')) return 'snow';
  if (lower.includes('thunderstorm')) return 'thunderstorm';
  if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze') || lower.includes('smoke')) return 'mist';

  return 'default';
}
