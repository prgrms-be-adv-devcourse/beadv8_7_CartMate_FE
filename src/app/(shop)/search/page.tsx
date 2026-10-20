import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchResults from './_components/SearchResults';

export const metadata: Metadata = { title: '검색 결과 | TEAMBUY' };

export default function SearchPage() {
    return (
        <div className="w-full bg-surface-container-lowest">
            <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
                {/* 검색어(쿼리스트링)를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                <Suspense>
                    <SearchResults />
                </Suspense>
            </div>
        </div>
    );
}
