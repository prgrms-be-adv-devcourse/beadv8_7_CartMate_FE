// BE(springdoc)가 만든 OpenAPI 문서를 orval이 쓰기 좋게 고친다. BE 코드는 고치지 않고 생성 단계에서만 보정한다.
//
// 1) 경로에 {id}가 있는데 파라미터 선언이 빠진 API → path 파라미터를 채워 넣는다. (없으면 orval 생성이 실패한다)
// 2) Spring이 객체로 받는 쿼리(Pageable, 검색 조건 DTO) → 필드별 쿼리 파라미터로 펼친다.
//    Spring은 page=0&size=10&title=... 처럼 평평한 쿼리로 바인딩하는데,
//    스펙에는 객체 하나로 적혀 있어 그대로 생성하면 request=[object Object] 로 직렬화된다.

type Schema = { $ref?: string; type?: string; properties?: Record<string, Schema>; [key: string]: unknown };
type Parameter = { name: string; in: string; required?: boolean; schema?: Schema; [key: string]: unknown };
type Operation = { parameters?: Parameter[]; [key: string]: unknown };
type Spec = {
    paths?: Record<string, Record<string, Operation | Parameter[]>>;
    components?: { schemas?: Record<string, Schema> };
    [key: string]: unknown;
};

const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'options', 'head'];

export default function transformOpenApi<T>(input: T): T {
    const spec = structuredClone(input) as Spec;
    const schemas = spec.components?.schemas ?? {};

    for (const [path, item] of Object.entries(spec.paths ?? {})) {
        const pathLevel = (item.parameters as Parameter[] | undefined) ?? [];

        for (const method of METHODS) {
            const operation = item[method] as Operation | undefined;
            if (!operation) continue;
            const params = operation.parameters ?? [];

            addMissingPathParams(path, params, pathLevel);
            operation.parameters = params.flatMap((param) => flattenObjectQuery(param, schemas));
        }
    }
    return spec as T;
}

function addMissingPathParams(path: string, params: Parameter[], pathLevel: Parameter[]) {
    for (const [, name] of path.matchAll(/\{([^}]+)\}/g)) {
        const declared = [...params, ...pathLevel].some((p) => p.in === 'path' && p.name === name);
        if (declared) continue;
        params.push({
            name,
            in: 'path',
            required: true,
            // ID 성격이면 정수, 아니면 문자열로 둔다.
            schema: /id$/i.test(name) ? { type: 'integer', format: 'int64' } : { type: 'string' },
        });
    }
}

function flattenObjectQuery(param: Parameter, schemas: Record<string, Schema>): Parameter[] {
    const ref = param.schema?.$ref;
    if (param.in !== 'query' || !ref) return [param];

    const target = schemas[ref.split('/').pop() ?? ''];
    if (!target?.properties) return [param];

    // 펼친 필드는 모두 선택값이다. (Spring 바인딩은 없는 필드를 null/기본값으로 둔다)
    return Object.entries(target.properties).map(([name, schema]) => ({
        name,
        in: 'query',
        required: false,
        schema,
        ...(schema.type === 'array' ? { explode: true } : {}),
    }));
}
