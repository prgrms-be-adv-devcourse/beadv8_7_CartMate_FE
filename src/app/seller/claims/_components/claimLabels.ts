// 판매자 교환 · 환불 화면이 함께 쓰는 라벨.

export const CLAIM_TYPE_LABEL: Record<string, string> = {
    EXCHANGE: '교환',
    REFUND: '환불',
};

export const CLAIM_REASON_LABEL: Record<string, string> = {
    SIZE_MISMATCH: '사이즈 불일치',
    SIMPLE_CHANGE: '단순 변심',
    PRODUCT_DEFECT: '상품 불량',
    WRONG_DELIVERY: '오배송',
    OTHER: '기타',
};

// 반품 환불 진행 상태. 승인하면 주문 서버가 쿠폰을 반영해 금액을 정하고 결제 서버가 환불한다(비동기).
// 목록에는 아직 끝나지 않았거나 실패한 환불만 적는다(끝난 환불은 "반품 · 완료"로 알 수 있다).
export const REFUND_STATUS_LABEL: Record<string, string> = {
    PENDING: '환불 진행 중',
    FAILED: '환불에 실패했습니다. 고객센터에서 확인 중입니다.',
};
