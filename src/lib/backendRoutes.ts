// /api 요청을 어느 BE 서비스로 보낼지 정한다. (서비스 분리 후, Gateway가 생기기 전까지)
// - API_BASE_URL이 있으면(나중에 Gateway) 모든 요청을 그곳 하나로 보낸다.
// - 없으면 아래 표대로 서비스마다 다른 주소로 보낸다. 주소는 서비스별 환경 변수로 바꿀 수 있다.
// next.config.ts(브라우저 요청 rewrites)와 api/http.ts(서버 컴포넌트 요청)가 같이 쓴다.

type Service = 'member' | 'product' | 'order' | 'payment' | 'etc';

const SERVICE_URL: Record<Service, string> = {
    member: process.env.MEMBER_SERVICE_URL ?? 'http://localhost:8981',
    product: process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:8982',
    payment: process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:8983',
    etc: process.env.ETC_SERVICE_URL ?? 'http://localhost:8984',
    order: process.env.ORDER_SERVICE_URL ?? 'http://localhost:8986',
};

// 주소 앞부분 → 서비스. BE 컨트롤러의 @RequestMapping과 맞춘다 (서비스를 옮기면 여기만 고친다)
export const API_PREFIXES: ReadonlyArray<readonly [string, Service]> = [
    ['/api/auth', 'member'],
    ['/api/members', 'member'],
    ['/api/admin/members', 'member'],
    ['/api/admin/dashboard', 'member'],

    ['/api/products', 'product'],
    ['/api/sales-posts', 'product'],
    ['/api/coupons', 'product'],
    ['/api/admin/products', 'product'],
    ['/api/admin/sales-posts', 'product'],
    ['/api/admin/coupons', 'product'],
    ['/api/admin/paybacks', 'product'],

    ['/api/orders', 'order'],
    ['/api/carts', 'order'],
    ['/api/group-orders', 'order'],
    ['/api/group-purchases', 'order'],
    ['/api/admin/carts', 'order'],

    ['/api/payments', 'payment'],
    ['/api/wallets', 'payment'],
    ['/api/settlements', 'payment'],
    ['/api/admin/payments', 'payment'],

    ['/api/deliveries', 'etc'],
    ['/api/claims', 'etc'],
    ['/api/notices', 'etc'],
    ['/api/sellers', 'etc'],
    ['/api/admin/notices', 'etc'],
];

export const GATEWAY_URL = process.env.API_BASE_URL;

export function serviceUrl(service: Service): string {
    return SERVICE_URL[service];
}

// 서버(RSC)에서 BE를 부를 때: 경로에 맞는 서비스 주소
export function backendBaseUrlFor(path: string): string {
    if (GATEWAY_URL) return GATEWAY_URL;
    const match = API_PREFIXES.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`));
    return match ? SERVICE_URL[match[1]] : SERVICE_URL.member;
}