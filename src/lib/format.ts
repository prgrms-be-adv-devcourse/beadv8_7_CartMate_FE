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

// BE는 시간대 없는 한국 시간(LocalDateTime)을 쓴다. 브라우저 시간대와 상관없이 같은 시각으로 다루기 위해
// 해석·표시를 모두 한국 시간(Asia/Seoul) 기준으로 한다.
const KST_OFFSET = '+09:00';
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' });

// "2026-10-20T11:03:10.187" 같은 BE 값을 실제 시각(Date)으로 바꾼다. 시간대가 이미 붙어 있으면 그대로 쓴다.
export function parseKst(value: string | undefined): Date | null {
    if (!value) return null;
    const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
    const date = new Date(hasZone ? value : `${value}${KST_OFFSET}`);
    return Number.isNaN(date.getTime()) ? null : date;
}

// 실제 시각을 BE에 보낼 한국 시간 문자열(YYYY-MM-DDTHH:mm)로 바꾼다. datetime-local 입력값에도 쓴다.
export function toKstLocal(date: Date): string {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        })
            .formatToParts(date)
            .map((p) => [p.type, p.value]),
    );
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function formatDateTime(value: string | undefined): string {
    if (!value) return '-';
    const date = parseKst(value);
    return date ? DATE_TIME_FORMAT.format(date) : value;
}
