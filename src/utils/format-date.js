/**
 * ISO 날짜 문자열을 'YY/MM/DD HH:mm' 형태로 변환
 * @param {string} value - ISO 날짜 문자열
 * @param {boolean} withTime - 시간 포함 여부
 * @returns {string}
 */
export function formatDate(value, withTime = false) {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  const date = `${String(d.getFullYear()).slice(2)}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
  return withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}
