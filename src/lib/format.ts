// 전화번호 입력 중 하이픈을 붙인다.
// 01012345678 → 010-1234-5678, 0111234567 → 011-123-4567, 0212345678 → 02-1234-5678
export function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    const area = digits.startsWith('02') ? 2 : 3;
    const rest = digits.slice(area);
    if (rest.length === 0) return digits;
    if (rest.length <= 3) return `${digits.slice(0, area)}-${rest}`;
    // 가운데 자리는 남은 숫자가 8자리면 4자리, 그보다 짧으면 3자리
    const middle = rest.length >= 8 ? 4 : 3;
    if (rest.length <= middle) return `${digits.slice(0, area)}-${rest}`;
    return `${digits.slice(0, area)}-${rest.slice(0, middle)}-${rest.slice(middle)}`;
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });

// BE의 LocalDateTime 문자열(시간대 없음, 한국 시간)을 화면용으로 바꾼다.
export function formatDateTime(value: string | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : DATE_TIME_FORMAT.format(date);
}
