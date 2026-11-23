/**
 * 날짜 문자열을 'YYYY.MM.DD' 형식으로 변환
 * 입력: '2025-12-01' | '2026. 3. 23.' | '2026.04.23' 등 (space-frontend formatDate 기준)
 */
export function formatDate(raw?: string): string {
  if (!raw) return ''
  const trimmed = raw.trim()

  const dotted = trimmed.match(/^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?$/)
  if (dotted) {
    const [, y, m, d] = dotted
    return `${y}.${m.padStart(2, '0')}.${d.padStart(2, '0')}`
  }

  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (iso) {
    const [, y, m, d] = iso
    return `${y}.${m.padStart(2, '0')}.${d.padStart(2, '0')}`
  }

  return trimmed
}
