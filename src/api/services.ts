// BE 서비스별 주소와 경로 접두어. next.config의 rewrites와 서버(RSC)의 http()가 같은 표를 쓴다.
// BE가 서비스 6개로 나뉘었지만 게이트웨이가 아직 없어(BE MSA-7) FE가 경로 접두어로 서비스를 고른다.
// 표 원본은 service-map.json이다(scripts/pull-openapi.mjs도 같은 파일에서 서비스 목록을 읽는다).
//
// 주소 우선순위: <서비스>_SERVICE_URL(예: ORDER_SERVICE_URL) > API_BASE_URL > http://localhost:<기본 포트>
// 게이트웨이가 생기면 API_BASE_URL 하나만 주면 모든 요청이 그 주소로 간다.
//
// 주의(배포): rewrites는 `next build` 때 이 값들로 굳어 routes-manifest에 들어가고, serverBaseUrl은 실행 중인 서버의
// process.env를 읽는다. 빌드 단계와 실행 단계에 같은 주소 환경변수를 줘야 브라우저 요청과 서버(RSC) 요청이 같은 곳으로 간다.
// (`next dev`는 시작할 때 읽으므로 값을 바꾸면 다시 띄운다.)
// ai-service(8987)는 외부 API가 없어 표에 넣지 않았다.
import services from './service-map.json';

export type ServiceName = keyof typeof services;

type Env = Record<string, string | undefined>;

export const SERVICE_NAMES = Object.keys(services) as ServiceName[];

export function serviceUrl(name: ServiceName, env: Env = process.env): string {
    return env[`${name.toUpperCase()}_SERVICE_URL`] ?? env.API_BASE_URL ?? `http://localhost:${services[name].port}`;
}

const matches = (path: string, prefix: string) =>
    path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`);

// 가장 긴 접두어가 이긴다. 지금은 서비스 사이에 겹치는 접두어가 없지만, 생겨도 더 구체적인 쪽으로 간다.
export function serviceForPath(path: string): ServiceName | undefined {
    let best: { name: ServiceName; length: number } | undefined;
    for (const name of SERVICE_NAMES) {
        for (const prefix of services[name].prefixes) {
            if (matches(path, prefix) && prefix.length > (best?.length ?? -1)) {
                best = { name, length: prefix.length };
            }
        }
    }
    return best?.name;
}

// 서버(RSC)에서 부를 때 붙일 BE 주소. 표에 없는 경로는 브라우저(rewrites)와 똑같이 API_BASE_URL(게이트웨이)로만 보내고,
// 그것도 없으면 바로 오류를 낸다(브라우저는 Next 404).
export function serverBaseUrl(path: string, env: Env = process.env): string {
    const name = serviceForPath(path);
    if (name) return serviceUrl(name, env);
    if (env.API_BASE_URL) return env.API_BASE_URL;
    throw new Error(`BE 서비스 표(service-map.json)에 없는 경로입니다: ${path}`);
}

// next.config rewrites. 긴 접두어를 앞에 둬서 겹치는 접두어가 생겨도 구체적인 규칙이 먼저 걸리게 한다.
export function apiRewrites(env: Env = process.env) {
    const rules = SERVICE_NAMES.flatMap((name) =>
        services[name].prefixes.map((prefix) => ({ prefix, base: serviceUrl(name, env) })),
    )
        .sort((a, b) => b.prefix.length - a.prefix.length)
        .map(({ prefix, base }) => ({
            source: `${prefix}/:path*`,
            destination: `${base}${prefix}/:path*`,
        }));

    // 상품 이미지 경로는 API 접두어 밖에 있으므로 별도로 product-service에 전달한다.
    rules.push({ source: '/images/:path*', destination: `${serviceUrl('product', env)}/images/:path*` });

    // 게이트웨이 주소가 있으면 표에 없는 /api/*도 넘긴다.
    if (env.API_BASE_URL) {
        rules.push({ source: '/api/:path*', destination: `${env.API_BASE_URL}/api/:path*` });
    }
    return rules;
}
