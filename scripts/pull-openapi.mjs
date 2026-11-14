// BE 서비스별 OpenAPI 문서를 받아 하나로 합쳐 openapi/cartmate.json 에 저장한다.
// 사용: npm run api:pull
//   - 서비스 목록 · 기본 포트: src/api/service-map.json (rewrites와 같은 표)
//   - 서비스 주소 변경: <서비스>_SERVICE_URL (예: ORDER_SERVICE_URL=http://localhost:9086)
//     rewrites와 달리 API_BASE_URL은 보지 않는다. 게이트웨이는 서비스별 /v3/api-docs를 한 주소로 주지 않으므로,
//     게이트웨이 · 모놀리스에서는 아래 OPENAPI_URL로 문서 하나를 받는다.
//   - 문서 하나만 받기(게이트웨이 · 모놀리스): OPENAPI_URL=http://host/v3/api-docs
//
// 합치는 규칙
//   - paths: 서비스 순서대로 붙인다. 실패하는 경우
//       · 같은 경로 · 메서드가 두 서비스에 있을 때(rewrites가 한쪽으로만 보낼 수 있어서)
//       · 받은 경로가 service-map.json에서 그 서비스로 매칭되지 않을 때(표를 고치지 않으면 rewrites가 엉뚱한 서비스로 보낸다)
//   - components.schemas: 이름과 내용이 같으면 하나로 합친다.
//     이름은 같은데 내용이 다르면 먼저 나온 서비스가 이름을 갖고, 뒤 서비스의 스키마는 <Service><Name>으로 바꾼 뒤
//     그 서비스 안의 $ref를 모두 고친다. 바뀐 스키마를 가리키는 스키마도 내용이 달라지므로, 더 바뀌는 이름이 없을 때까지
//     반복해서 함께 바꾼다. 바꾼 목록은 콘솔에 경고로 남긴다.
//     새 이름(<Service><Name>)이 이미 다른 내용으로 있으면 실패한다(번호를 붙이면 이름이 불안정해져 생성 훅 이름이 밀린다).
//   - components의 schemas 외 항목(securitySchemes 등)과 discriminator.mapping 안의 참조는 다루지 않는다(지금 BE 스펙에 없음).
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const outFile = new URL('../openapi/cartmate.json', import.meta.url);
const services = JSON.parse(await readFile(new URL('../src/api/service-map.json', import.meta.url), 'utf8'));

const serviceUrl = (name) =>
    process.env[`${name.toUpperCase()}_SERVICE_URL`] ?? `http://localhost:${services[name].port}`;

async function fetchSpec(label, url) {
    const response = await fetch(url).catch((error) => {
        console.error(`OpenAPI 문서를 받지 못했습니다(${label}): ${url}\n서버가 떠 있는지 확인하세요. (${error.message})`);
        process.exit(1);
    });
    if (!response.ok) {
        console.error(`OpenAPI 문서 요청 실패(${label}): ${response.status} ${url}`);
        process.exit(1);
    }
    return response.json();
}

const pascal = (name) => name.charAt(0).toUpperCase() + name.slice(1);
const fail = (message) => {
    console.error(message);
    process.exit(1);
};

// src/api/services.ts의 serviceForPath와 같은 규칙: 접두어와 같거나 '접두어/' · '접두어?'로 시작하고, 가장 긴 접두어가 이긴다.
const matches = (path, prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`);
function serviceForPath(path) {
    let best;
    for (const [name, { prefixes }] of Object.entries(services)) {
        for (const prefix of prefixes) {
            if (matches(path, prefix) && prefix.length > (best?.length ?? -1)) best = { name, length: prefix.length };
        }
    }
    return best?.name;
}

// 서비스 스펙 안의 스키마 참조 이름을 바꾼다.
function renameRefs(node, renames) {
    if (Array.isArray(node)) return node.map((item) => renameRefs(item, renames));
    if (node && typeof node === 'object') {
        return Object.fromEntries(
            Object.entries(node).map(([key, value]) => {
                if (key === '$ref' && typeof value === 'string') {
                    const name = value.replace('#/components/schemas/', '');
                    return [key, renames[name] ? `#/components/schemas/${renames[name]}` : value];
                }
                return [key, renameRefs(value, renames)];
            }),
        );
    }
    return node;
}

function merge(specs) {
    const merged = {
        openapi: specs[0].spec.openapi,
        // 생성 파일 머리 주석이 이 값을 쓴다. 바꾸면 생성 파일 전체가 바뀌므로 첫 서비스 값을 그대로 둔다.
        info: specs[0].spec.info,
        // 브라우저는 상대 경로(/api/...)로 부르고 rewrites가 서비스로 보낸다.
        servers: [{ url: '/' }],
        paths: {},
        components: { schemas: {} },
    };
    const schemaOwner = {};
    const warnings = [];

    for (const { name, spec: original } of specs) {
        const schemas = original.components?.schemas ?? {};
        // 참조를 바꾼 뒤의 내용으로 다시 비교한다. 바뀐 스키마를 가리키던 스키마(RsDataFoo 등)도 내용이 달라져 함께 바뀐다.
        const renames = {};
        for (let changed = true; changed; ) {
            changed = false;
            const current = renameRefs(schemas, renames);
            for (const [schemaName, schema] of Object.entries(current)) {
                if (renames[schemaName]) continue;
                const existing = merged.components.schemas[schemaName];
                if (existing && JSON.stringify(existing) !== JSON.stringify(schema)) {
                    renames[schemaName] = `${pascal(name)}${schemaName}`;
                    changed = true;
                }
            }
        }
        const spec = Object.keys(renames).length ? renameRefs(original, renames) : original;

        for (const [schemaName, schema] of Object.entries(spec.components?.schemas ?? {})) {
            const target = renames[schemaName] ?? schemaName;
            const existing = merged.components.schemas[target];
            if (renames[schemaName]) {
                if (existing && JSON.stringify(existing) !== JSON.stringify(schema)) {
                    fail(`스키마 새 이름도 충돌합니다: ${schemaName} → ${target} (${schemaOwner[target]} ≠ ${name}). service-map.json 순서나 BE 스키마 이름을 확인하세요.`);
                }
                warnings.push(`스키마 이름 충돌: ${schemaName} (${schemaOwner[schemaName]} ≠ ${name}) → ${name} 쪽을 ${target}로 바꿈`);
            }
            if (existing) continue; // 이름 · 내용이 같은 스키마
            merged.components.schemas[target] = schema;
            schemaOwner[target] = name;
        }

        for (const [path, item] of Object.entries(spec.paths ?? {})) {
            const routed = serviceForPath(path);
            if (routed !== name) {
                const where = routed ? `${routed}로 매칭됩니다` : '어느 서비스에도 매칭되지 않습니다';
                fail(`${name} 서비스의 경로 ${path}가 service-map.json에서 ${where}. 표에 접두어를 추가 · 수정하세요.`);
            }
            const current = (merged.paths[path] ??= {});
            for (const [method, operation] of Object.entries(item)) {
                if (current[method]) {
                    fail(`같은 API가 두 서비스에 있습니다: ${method.toUpperCase()} ${path} (${name})`);
                }
                current[method] = operation;
            }
        }
    }
    return { merged, warnings };
}

let spec;
if (process.env.OPENAPI_URL) {
    spec = await fetchSpec('OPENAPI_URL', process.env.OPENAPI_URL);
} else {
    const specs = [];
    for (const name of Object.keys(services)) {
        const url = `${serviceUrl(name)}/v3/api-docs`;
        const serviceSpec = await fetchSpec(name, url);
        console.log(`받음: ${name} ${url} (${Object.keys(serviceSpec.paths ?? {}).length} paths)`);
        specs.push({ name, spec: serviceSpec });
    }
    const { merged, warnings } = merge(specs);
    for (const warning of warnings) console.warn(`경고: ${warning}`);
    spec = merged;
}

// 커밋 diff가 읽히도록 들여쓰기해서 저장한다.
await mkdir(new URL('.', outFile), { recursive: true });
await writeFile(outFile, `${JSON.stringify(spec, null, 2)}\n`);

console.log(`저장 완료: openapi/cartmate.json (${Object.keys(spec.paths ?? {}).length} paths)`);
