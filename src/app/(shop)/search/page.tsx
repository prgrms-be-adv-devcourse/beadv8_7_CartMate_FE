import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchResults from './_components/SearchResults';

export const metadata: Metadata = { title: '검색 결과 | TEAMBUY' };

export default function SearchPage() {
    return (
        <div className="w-full">
            <div className="max-w-[1200px] mx-auto px-4 py-10 sm:px-6 sm:py-12">
                {/* 검색어(쿼리스트링)를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                <Suspense>
                    <SearchResults />
                </Suspense>
            </div>
        </div>
    );
}
