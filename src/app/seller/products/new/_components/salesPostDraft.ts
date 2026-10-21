import type { CreateSalesPostRequest } from '@/api/generated/model';
import { ApiError } from '@/api/http';

// BE에 카테고리 목록 API·테이블이 없다. categoryId는 검증 없는 숫자라서
// 테스트 데이터(scripts/seed-local.sh)가 쓰는 값과 같은 고정 선택지를 둔다.
export const CATEGORIES = [
    { id: 1, label: '유니폼 / 의류' },
    { id: 2, label: '공 / 구기 용품' },
    { id: 3, label: '신발' },
    { id: 4, label: '운동 용품 / 보호구' },
] as const;

// BE 상품 옵션(#47)은 { productTypeId, productOptionId } 숫자 쌍만 저장하고 이름 테이블이 없다.
// FE에서 종류·값 id를 고정해 두고, 같은 id를 쓰는 한 화면 간 뜻이 같게 유지한다.
export const OPTION_TYPES = [
    {
        id: 1,
        label: '사이즈',
        options: [
            { id: 1, label: 'S' },
            { id: 2, label: 'M' },
            { id: 3, label: 'L' },
            { id: 4, label: 'XL' },
            { id: 5, label: 'XXL' },
            { id: 6, label: 'FREE' },
        ],
    },
    {
        id: 2,
        label: '색상',
        options: [
            { id: 1, label: '블랙' },
            { id: 2, label: '화이트' },
            { id: 3, label: '네이비' },
            { id: 4, label: '레드' },
            { id: 5, label: '블루' },
            { id: 6, label: '그레이' },
        ],
    },
] as const;

// BE 제한: 판매글당 상품 1~5개, 이미지 합계 1~20장, 이미지는 JPEG·PNG·WEBP(파일 헤더로 검사)
// 업로드 크기 설정이 없어 Spring 기본값(파일당 1MB, 요청당 10MB)이 적용된다.
export const MAX_PRODUCTS = 5;
export const MAX_IMAGES_PER_PRODUCT = 5;
export const MAX_TOTAL_IMAGES = 20;
export const MAX_IMAGE_BYTES = 1024 * 1024;
export const MAX_REQUEST_BYTES = 9.5 * 1024 * 1024;
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
// 문자열 컬럼은 길이 지정이 없어 varchar(255)다.
// 제목·상품명은 BE 한도(255)보다 짧게 둔다: 상품 카드·상세 제목·검색 결과에서 두세 줄 안에 보이게 하려는 화면 정책.
export const MAX_TITLE = 100;
export const MAX_TEXT = 255;
export const MAX_PRICE = 100_000_000;

export type OptionRow = { key: number; typeId: number; optionId: number };
export type ImageItem = { key: number; file: File };

export type ProductDraft = {
    key: number;
    name: string;
    categoryId: string;
    price: string;
    description: string;
    images: ImageItem[];
    options: OptionRow[];
};

// 행 key 발급. 서버 렌더와 첫 클라이언트 렌더가 같아야 하므로 첫 상품은 key 0으로 고정하고(INITIAL_PRODUCT_KEY),
// 이후 추가되는 행만 이 카운터를 쓴다. (모듈 변수는 서버에서 요청마다 계속 증가해 key가 어긋난다)
let seq = 0;
export const nextKey = () => ++seq;
export const INITIAL_PRODUCT_KEY = 0;

export function emptyProduct(key: number = nextKey()): ProductDraft {
    return { key, name: '', categoryId: '', price: '', description: '', images: [], options: [] };
}

export function optionLabel(typeId: number, optionId: number): string {
    const type = OPTION_TYPES.find((t) => t.id === typeId);
    const option = type?.options.find((o) => o.id === optionId);
    return type && option ? `${type.label} ${option.label}` : `옵션 ${typeId}-${optionId}`;
}

export function parsePrice(value: string): number | null {
    const digits = value.replace(/[^0-9]/g, '');
    if (!digits) return null;
    return Number(digits);
}

// 입력 검증. 키는 문제 위치(title, content, images, p<상품 key>.<칸>)이고 화면에서 해당 칸 아래에 표시한다.
export type FormErrors = Record<string, string>;

export function validate(title: string, content: string, products: ProductDraft[]): FormErrors {
    const errors: FormErrors = {};
    if (!title.trim()) errors.title = '판매글 제목을 입력해 주세요.';
    else if (title.trim().length > MAX_TITLE) errors.title = `제목은 ${MAX_TITLE}자 이하로 입력해 주세요.`;
    if (content.trim().length > MAX_TEXT) errors.content = `상세 설명은 ${MAX_TEXT}자 이하로 입력해 주세요.`;

    products.forEach((p, i) => {
        const at = (field: string) => `p${p.key}.${field}`;
        const label = products.length > 1 ? `상품 ${i + 1}: ` : '';
        if (!p.name.trim()) errors[at('name')] = `${label}상품명을 입력해 주세요.`;
        else if (p.name.trim().length > MAX_TITLE) errors[at('name')] = `${label}상품명은 ${MAX_TITLE}자 이하로 입력해 주세요.`;
        if (!p.categoryId) errors[at('category')] = `${label}카테고리를 선택해 주세요.`;
        const price = parsePrice(p.price);
        if (price === null || price <= 0) errors[at('price')] = `${label}가격을 1원 이상 입력해 주세요.`;
        else if (price > MAX_PRICE) errors[at('price')] = `${label}가격은 1억 원 이하로 입력해 주세요.`;
        if (p.description.trim().length > MAX_TEXT) errors[at('description')] = `${label}상품 설명은 ${MAX_TEXT}자 이하로 입력해 주세요.`;
        if (p.images.length === 0) errors[at('images')] = `${label}이미지를 1장 이상 올려 주세요.`;
        const pairs = new Set(p.options.map((o) => `${o.typeId}-${o.optionId}`));
        if (pairs.size !== p.options.length) errors[at('options')] = `${label}같은 옵션이 두 번 들어 있습니다.`;
    });

    const total = products.reduce((sum, p) => sum + p.images.length, 0);
    if (total > MAX_TOTAL_IMAGES) errors.imagesCount = `이미지는 판매글 전체에서 ${MAX_TOTAL_IMAGES}장까지 올릴 수 있습니다.`;
    const bytes = products.reduce((sum, p) => sum + p.images.reduce((s, img) => s + img.file.size, 0), 0);
    if (bytes > MAX_REQUEST_BYTES) errors.imagesSize = '이미지 용량 합계가 너무 큽니다. (합계 약 9MB 이하)';
    return errors;
}

// BE는 요청 JSON의 productImageList 개수만큼 images 파일을 순서대로 짝짓는다.
// 그래서 상품 순서 → 상품 안 이미지 순서로 파일을 붙이고, 같은 순서로 imageSeq를 매긴다.
export function buildFormData(sellerId: number, title: string, content: string, products: ProductDraft[]): FormData {
    const request: CreateSalesPostRequest = {
        sellerId,
        title: title.trim(),
        content: content.trim(),
        productList: products.map((p) => ({
            categoryId: Number(p.categoryId),
            name: p.name.trim(),
            description: p.description.trim(),
            basePrice: parsePrice(p.price) ?? 0,
            productImageList: p.images.map((_, imageSeq) => ({ imageSeq })),
            productOptionList: p.options.map((o) => ({ productTypeId: o.typeId, productOptionId: o.optionId })),
        })),
    };

    const formData = new FormData();
    // 문자열로 붙이면 파트에 Content-Type이 없어 BE가 415를 돌려준다 → application/json Blob으로 붙인다.
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    products.forEach((p) => p.images.forEach((img) => formData.append('images', img.file, img.file.name)));
    return formData;
}

// 오류 문구 <p>의 id. 입력칸의 aria-describedby와 짝을 맞춘다.
export const errorId = (key: string) => `err-${key.replace(/\./g, '-')}`;

// 5xx·네트워크 오류 뒤 다시 조회해도 새 글을 찾지 못했을 때. 실제로는 등록됐을 수 있어 바로 재시도를 권하지 않는다.
export class RegisterUncertainError extends Error {
    constructor() {
        super('등록 결과를 확인하지 못했습니다. 홈·검색에서 판매글이 올라왔는지 확인한 뒤 다시 시도해 주세요.');
        this.name = 'RegisterUncertainError';
    }
}

export function submitErrorMessage(error: unknown): string {
    if (error instanceof RegisterUncertainError) return error.message;
    if (error instanceof ApiError) {
        switch (error.status) {
            case 0:
                return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
            case 400:
                return `${error.message} 입력값과 이미지 형식(JPEG·PNG·WEBP)을 확인해 주세요.`;
            case 401:
                return '로그인이 만료되었습니다. 다시 로그인해 주세요.';
            case 403:
                return '판매글을 등록할 권한이 없습니다. 판매자 계정으로 로그인해 주세요.';
            case 409:
                return `${error.message} 잠시 후 다시 시도해 주세요.`;
            case 413:
                return '이미지 용량이 너무 큽니다. 한 장에 1MB 이하로 올려 주세요.';
            case 503:
                return '상품 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.';
            default:
                return error.message;
        }
    }
    return '판매글 등록 중 문제가 발생했습니다.';
}
