import type { ReactNode } from 'react';
import type { SharedGroupPurchaseDetailItemResponse } from '@/api/generated/model';
import { formatDateTime } from '@/lib/format';
import { formatPrice } from '@/lib/salesPost';
import ItemThumb from './ItemThumb';

type ItemRowProps = { item: SharedGroupPurchaseDetailItemResponse; controls?: ReactNode };

// 공동구매에 담긴 품목 한 줄. 편집 화면은 controls로 수량·삭제 버튼을 붙인다.
export default function SharedItemRow({ item, controls }: ItemRowProps) {
    const purchasable = item.purchasable !== false;
    // 상품이 삭제되면 BE가 이름·가격 없이 구매 불가로만 내려준다.
    const name = item.productName ?? '삭제된 상품';
    return (
        <div className={`p-space-md rounded-lg flex flex-col sm:flex-row sm:items-start gap-space-md ${purchasable ? 'bg-surface-container-low' : 'bg-error-container/20'}`}>
            <div className="flex items-start gap-space-md flex-1 min-w-0">
                <div className="relative">
                    <ItemThumb src={item.imageUrl} className="w-20 h-20" />
                    {!purchasable && (
                        <div className="absolute bottom-0 inset-x-0 bg-error text-on-error font-caption text-caption text-center py-0.5 rounded-b-lg">구매 불가</div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-space-sm mb-1">
                        <h3 className={`font-label-md text-label-md font-bold truncate ${purchasable ? 'text-primary' : 'text-error'}`}>{name}</h3>
                        <span className="font-headline-sm text-headline-sm text-primary whitespace-nowrap">
                            {purchasable ? formatPrice(item.totalPrice ?? 0) : '-'}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface">
                            옵션: {item.optionName ?? '기본'}
                        </span>
                        <span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface">수량: {item.quantity ?? 0}개</span>
                        {purchasable && <span className="font-caption text-caption text-secondary">개당 {formatPrice(item.price ?? 0)}</span>}
                    </div>
                    {!purchasable && <p className="font-caption text-caption text-error mt-1">판매가 중지되었거나 삭제된 상품이라 합계에서 빠졌습니다.</p>}
                    <p className="font-caption text-caption text-secondary mt-1">
                        마지막 수정: {item.updatedMemberNickname ?? '알 수 없음'} · {formatDateTime(item.updatedAt)}
                    </p>
                </div>
            </div>
            {controls}
        </div>
    );
}
