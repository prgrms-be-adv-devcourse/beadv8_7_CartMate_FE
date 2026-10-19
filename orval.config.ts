import { defineConfig } from 'orval';

// 저장소에 커밋된 OpenAPI 스냅샷으로 API 함수·타입·React Query 훅을 생성한다.
// BE 없이도 생성할 수 있다. 스펙 갱신은 `npm run api:pull`, 생성은 `npm run api:gen`.
export default defineConfig({
    cartmate: {
        input: {
            target: './openapi/cartmate.json',
        },
        output: {
            mode: 'tags-split',
            target: 'src/api/generated',
            schemas: 'src/api/generated/model',
            client: 'react-query',
            httpClient: 'fetch',
            clean: true,
            override: {
                mutator: {
                    path: 'src/api/http.ts',
                    name: 'http',
                },
                fetch: {
                    // 응답 본문(RsData)만 돌려받는다.
                    includeHttpResponseReturnType: false,
                },
            },
        },
    },
});
