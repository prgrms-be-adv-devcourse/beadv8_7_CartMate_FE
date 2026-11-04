import type { CreateSalesPostRequest } from '@/api/generated/model';
import { http } from '@/api/http';

// BE는 multipart: request(application/json) + images(file).
// orval 생성 코드는 request를 문자열로 넣어 Spring @RequestPart 바인딩이 깨질 수 있어 Blob으로 보낸다.
export function registerSalesPostMultipart(request: CreateSalesPostRequest, images: Blob[]) {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    for (const image of images) {
        formData.append('images', image);
    }
    return http<void>('/api/sales-posts', { method: 'POST', body: formData });
}
