// BE의 OpenAPI 문서를 받아 openapi/cartmate.json 에 저장한다.
// 사용: npm run api:pull  (기본 http://localhost:8985/v3/api-docs, OPENAPI_URL 로 변경 가능)
import { mkdir, writeFile } from 'node:fs/promises';

const url = process.env.OPENAPI_URL ?? 'http://localhost:8985/v3/api-docs';
const outFile = new URL('../openapi/cartmate.json', import.meta.url);

const response = await fetch(url).catch((error) => {
    console.error(`OpenAPI 문서를 받지 못했습니다: ${url}\nBE 서버가 떠 있는지 확인하세요. (${error.message})`);
    process.exit(1);
});

if (!response.ok) {
    console.error(`OpenAPI 문서 요청 실패: ${response.status} ${url}`);
    process.exit(1);
}

const spec = await response.json();

// 커밋 diff가 읽히도록 들여쓰기해서 저장한다.
await mkdir(new URL('.', outFile), { recursive: true });
await writeFile(outFile, `${JSON.stringify(spec, null, 2)}\n`);

console.log(`저장 완료: openapi/cartmate.json (${Object.keys(spec.paths ?? {}).length} paths)`);
