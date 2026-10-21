import { ApiError, errorMessage } from '@/api/http';
import type { DeliveryDetailResponse, SellerDeliveryResponse } from '@/api/generated/model';
import { GetSellerDeliveriesStatus } from '@/api/generated/model';

export type DeliveryStatus = GetSellerDeliveriesStatus;

// 상태 탭 순서. BE 상태 전이: 배송요청 → (송장 등록) 배송준비 → (발송) 배송중 → 배송완료 → 구매확정, 그 밖에 취소.
export const STATUS_TABS: { status: DeliveryStatus; label: string }[] = [
    { status: GetSellerDeliveriesStatus.REQUESTED, label: '배송 요청' },
    { status: GetSellerDeliveriesStatus.PREPARING, label: '배송 준비' },
    { status: GetSellerDeliveriesStatus.SHIPPING, label: '배송 중' },
    { status: GetSellerDeliveriesStatus.DELIVERED, label: '배송 완료' },
    { status: GetSellerDeliveriesStatus.CONFIRMED, label: '구매 확정' },
    { status: GetSellerDeliveriesStatus.CANCELED, label: '취소' },
];

export const STATUS_LABEL: Record<DeliveryStatus, string> = {
    REQUESTED: '배송요청',
    PREPARING: '배송준비',
    SHIPPING: '배송중',
    DELIVERED: '배송완료',
    CONFIRMED: '구매확정',
    CANCELED: '배송취소',
};

export const STATUS_BADGE: Record<DeliveryStatus, string> = {
    REQUESTED: 'bg-surface-container-high text-on-surface',
    PREPARING: 'bg-primary-fixed text-primary',
    SHIPPING: 'bg-primary text-on-primary',
    DELIVERED: 'bg-secondary-container text-on-secondary-container',
    CONFIRMED: 'bg-surface-container-highest text-on-surface-variant',
    CANCELED: 'bg-error-container text-on-error-container',
};

export function isDeliveryStatus(value: string | null): value is DeliveryStatus {
    return value !== null && Object.hasOwn(STATUS_LABEL, value);
}

export const PURCHASE_TYPE_LABEL: Record<string, string> = {
    INDIVIDUAL_GROUP: '개인물품 공동구매',
    SHARED_GROUP: '공동물품 공동구매',
};

// BE는 택배사를 자유 문자열로 받는다. 화면에서는 자주 쓰는 택배사만 고르게 한다.
export const CARRIERS = ['CJ대한통운', '우체국택배', '롯데택배', '한진택배', '로젠택배', '경동택배'];

export const TRACKING_NUMBER_MAX = 50;

// 생성 스펙에서 배송 상품 스키마(Item)가 클레임 쪽 Item과 이름이 겹쳐 deliveryItemId·quantity만 남았다.
// 실제 응답에는 상품명·옵션이 있으므로 화면에서는 이 모양으로 읽는다. (BE ISS-3: 스키마 이름 충돌)
// TODO: BE가 스키마 이름을 고치고 orval을 다시 생성하면 생성 타입으로 바꾼다.
export type DeliveryItem = {
    deliveryItemId?: number;
    orderItemId?: number;
    productName?: string;
    quantity?: number;
    options?: { optionName?: string; optionValue?: string }[];
};

export function itemsOf(delivery: SellerDeliveryResponse | DeliveryDetailResponse | undefined): DeliveryItem[] {
    return (delivery?.items ?? []) as DeliveryItem[];
}

export function optionText(item: DeliveryItem): string {
    return (item.options ?? [])
        .filter((o) => o.optionName || o.optionValue)
        .map((o) => `${o.optionName ?? ''}: ${o.optionValue ?? ''}`)
        .join(' / ');
}

export function fullAddress(d: { zipCode?: string; address?: string; addressDetail?: string }): string {
    const base = [d.address, d.addressDetail].filter(Boolean).join(' ');
    return d.zipCode ? `(${d.zipCode}) ${base}` : base;
}

// 배송 처리 실패 문구. 상태가 이미 바뀐 경우(409)와 배송이 사라진 경우(404)는 목록을 다시 받아야 한다.
export function deliveryErrorMessage(error: unknown): { message: string; stale: boolean } {
    if (!(error instanceof ApiError)) return { message: errorMessage(error), stale: false };
    const code = error.resultCode ?? '';
    if (code.endsWith('DELIVERY_ALREADY_PREPARED')) {
        return { message: '이미 다른 송장 정보로 배송 준비된 건입니다. 목록을 새로 불러왔습니다.', stale: true };
    }
    if (code.endsWith('DELIVERY_INVALID_STATUS')) {
        return { message: '현재 배송 상태에서는 처리할 수 없습니다. 다른 곳에서 상태가 바뀌었을 수 있어 목록을 새로 불러왔습니다.', stale: true };
    }
    if (error.status === 404) {
        return { message: '배송을 찾을 수 없습니다. 목록을 새로 불러왔습니다.', stale: true };
    }
    if (error.status === 403) {
        return { message: '이 배송을 처리할 권한이 없습니다. 판매자 계정으로 로그인했는지 확인해 주세요.', stale: false };
    }
    if (error.status === 401) {
        return { message: '로그인이 만료되었습니다. 다시 로그인해 주세요.', stale: false };
    }
    return { message: error.message, stale: false };
}

// 목록·상세 조회 실패 문구
export function loadErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.resultCode?.endsWith('DELIVERY_SELLER_ONLY')) return '판매자 정보가 등록되지 않은 계정이라 배송을 조회할 수 없습니다.';
        if (error.status === 403) return '이 배송을 조회할 권한이 없습니다.';
        if (error.status === 404) return '배송을 찾을 수 없습니다.';
        if (error.status === 401) return '로그인이 만료되었습니다. 다시 로그인해 주세요.';
    }
    return errorMessage(error, '배송 정보를 불러오지 못했습니다.');
}
