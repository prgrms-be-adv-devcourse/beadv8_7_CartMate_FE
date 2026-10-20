// 판매 기한 규칙은 BE IndividualGroupPurchase와 맞춘다: 지금 이후, 지금부터 48시간 이내.
import { parseKst } from '@/lib/format';

export const MAX_SALE_HOURS = 48;

// <input type="datetime-local"> 값과 BE 값은 모두 한국 시간이다. 브라우저 시간대가 달라도 어긋나지 않게
// 변환은 lib/format 의 한국 시간 기준 함수로 한다.
export { toKstLocal as toLocalInputValue } from '@/lib/format';

// BE LocalDateTime은 시간대가 붙은 값(+09:00, Z)을 받지 못하고 RsData가 아닌 400을 돌려준다.
export function toBeLocalDateTime(inputValue: string): string {
    return inputValue.length === 16 ? `${inputValue}:00` : inputValue;
}

export function deadlineBounds(now = new Date()) {
    return { min: now, max: new Date(now.getTime() + MAX_SALE_HOURS * 60 * 60 * 1000) };
}

// 남은 시간 안내용. 지났으면 null.
export function remainingText(deadlineAt: string | undefined, now: Date): string | null {
    if (!deadlineAt) return null;
    const deadline = parseKst(deadlineAt);
    if (!deadline) return null;
    const left = deadline.getTime() - now.getTime();
    if (left <= 0) return null;
    const minutes = Math.floor(left / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}시간 ${minutes % 60}분 남음` : `${minutes}분 남음`;
}
