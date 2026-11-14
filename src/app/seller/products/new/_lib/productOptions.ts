import { useQuery } from '@tanstack/react-query';
import { http, type RsData } from '@/api/http';

// GET /api/products/options 응답. 생성 타입(orval)이 아직 이 API를 모르므로 BE 응답 모양을 그대로 옮겨 적는다.
// BE: ProductOptionTypeResponse(typeId, typeName, options) · ProductOptionValueResponse(optionId, name)

// 상품옵션 하나 (예: optionId 27, "265"). 등록 요청의 productOptionId로 그대로 쓴다
export type ProductOptionValueItem = {
    optionId: number;
    name: string;
};

// 옵션 종류 하나와 그 종류의 상품옵션 목록 (예: typeId 3 "신발 사이즈" → 220 ~ 300)
export type ProductOptionTypeItem = {
    typeId: number;
    typeName: string;
    options: ProductOptionValueItem[];
};

const PRODUCT_OPTIONS_KEY = ['product-options'] as const;

function fetchProductOptions(): Promise<ProductOptionTypeItem[]> {
    return http<RsData<ProductOptionTypeItem[]>>('/api/products/options').then((res) => res.data ?? []);
}

// 옵션 종류 전체와 종류별 상품옵션. 화면 진입 때 한 번 받아 두고,
// 옵션 종류를 고르면 서버를 다시 부르지 않고 optionsByTypeId에서 옆 select를 채운다.
export function useProductOptionTypes() {
    const query = useQuery({
        queryKey: PRODUCT_OPTIONS_KEY,
        queryFn: fetchProductOptions,
        // 옵션 마스터는 서버 시작 때 들어가는 고정 데이터라 자주 바뀌지 않는다
        staleTime: 10 * 60 * 1000,
    });
    const types = query.data ?? [];
    const optionsByTypeId = new Map(types.map((type) => [type.typeId, type.options]));
    return { types, optionsByTypeId, isLoading: query.isPending, error: query.error };
}
