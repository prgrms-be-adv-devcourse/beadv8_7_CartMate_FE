// 정산 화면 공용 표시 형식

// 금액은 "₩ 1,234,000" 형태로 보여 준다.
export function won(amount: number | undefined): string {
    return `₩ ${(amount ?? 0).toLocaleString('ko-KR')}`;
}

// BE 의 날짜(2026-10-01)를 "2026.10.01" 로 바꾼다.
export function dotDate(date: string | undefined): string {
    return date ? date.replaceAll('-', '.') : '-';
}
