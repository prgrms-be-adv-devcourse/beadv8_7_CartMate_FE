import type { CreateProductOption, CreateSalesPostProduct, CreateSalesPostRequest } from '@/api/generated/model';
import { http } from '@/api/http';

// 등록 요청의 재고 하나: 상품옵션 조합 + 추가금액 + 재고 수량 (BE CreateInventory)
// optionList가 비어 있으면 옵션 없는 상품의 "기본" 재고
export type CreateInventoryRequest = {
    optionList: Required<CreateProductOption>[];
    additionalPrice: number;
    stockQuantity: number;
};

// 생성 타입(orval)은 재고 도입 전 BE 스펙이라 inventoryList가 없고 옛 productOptionList가 있다.
// API 타입을 다시 생성하기 전까지 BE 요청 모양(CreateSalesPostProduct.inventoryList)에 맞춰 덮어쓴다.
export type CreateSalesPostProductRequest = Omit<CreateSalesPostProduct, 'productOptionList'> & {
    inventoryList: CreateInventoryRequest[];
};

export type RegisterSalesPostRequest = Omit<CreateSalesPostRequest, 'productList'> & {
    productList: CreateSalesPostProductRequest[];
};

// BE는 multipart: request(application/json) + images(file).
// orval 생성 코드는 request를 문자열로 넣어 Spring @RequestPart 바인딩이 깨질 수 있어 Blob으로 보낸다.
export function registerSalesPostMultipart(request: RegisterSalesPostRequest, images: Blob[]) {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    for (const image of images) {
        formData.append('images', image);
    }
    return http<void>('/api/sales-posts', { method: 'POST', body: formData });
}
