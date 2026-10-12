import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import StatusTabs from './_components/StatusTabs';

export const metadata: Metadata = { title: '판매글 관리 | TEAMBUY' };

const PRODUCTS = [
    { name: '프로 페셔널 축구 유니폼 상하트 세트 (커스텀 마이징)', meta: '카테고리: 단체복 / 축구 | 최소주문수량: 10벌', price: '45,000원', onSale: true, createdAt: '2024-10-24 14:32' },
    { name: '프리미엄 농구 가방 백팩 (대용량)', meta: '카테고리: 가방/잡화 | 최소주문수량: 5개', price: '68,000원', onSale: true, createdAt: '2024-10-20 09:15' },
    { name: '팀 트레이닝용 축구공 (FIFA 수공예 규격)', meta: '카테고리: 구기용품 | 최소주문수량: 10개', price: '32,000원', onSale: false, createdAt: '2024-09-15 18:40' },
    { name: '기능성 쿨링 스포츠 삭스 (10켤레 묶음)', meta: '카테고리: 의류/잡화 | 최소주문수량: 20세트', price: '15,000원', onSale: true, createdAt: '2024-10-02 11:05' },
];

export default function SellerProductsPage() {
    return (
        <div className="flex flex-col w-full">
            {/* Top Action & Filter Bar */}
            <div className="flex items-center justify-between mb-space-xl">
                <StatusTabs />
                <div className="flex items-center gap-space-md">
                    <div className="relative">
                        <input className="h-10 pl-10 pr-space-md bg-surface-container-low text-on-surface rounded border border-surface-variant focus:outline-none focus:border-primary text-body-sm w-64" placeholder="상품명 검색..." type="text" />
                        <Icon name="search" className="absolute left-3 top-2.5 text-on-surface-variant text-[20px]" />
                    </div>
                    <Link href={ROUTES.sellerProductNew} className="flex items-center gap-space-xs px-space-md py-2.5 bg-primary text-on-primary rounded font-label-md hover:opacity-90 transition-all shadow-sm">
                        <Icon name="add" className="text-[18px]" />
                        판매글 등록
                    </Link>
                </div>
            </div>
            {/* Product Management Table Container */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low border-b border-surface-variant text-on-surface-variant text-caption font-label-sm">
                            <th className="py-space-md px-space-lg w-12 text-center">
                                <input className="rounded border-outline-variant text-primary focus:ring-0" type="checkbox" />
                            </th>
                            <th className="py-space-md px-space-lg w-20 text-center">상품 이미지</th>
                            <th className="py-space-md px-space-lg">상품명 / 옵션 정보</th>
                            <th className="py-space-md px-space-lg">판매가</th>
                            <th className="py-space-md px-space-lg text-center">상태</th>
                            <th className="py-space-md px-space-lg">등록일시</th>
                            <th className="py-space-md px-space-lg text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant text-body-md text-on-surface">
                        {PRODUCTS.map((product) => (
                            <tr key={product.name} className="hover:bg-surface-container-low/50 transition-colors">
                                <td className="py-space-md px-space-lg text-center">
                                    <input className="rounded border-outline-variant text-primary focus:ring-0" type="checkbox" />
                                </td>
                                <td className="py-space-md px-space-lg">
                                    <div className="w-12 h-12 bg-surface-container-high rounded border border-surface-variant flex items-center justify-center overflow-hidden relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Icon name="image" className="text-outline-variant text-[24px]" />
                                        </div>
                                    </div>
                                </td>
                                <td className="py-space-md px-space-lg">
                                    <div className="font-headline-sm text-on-surface">{product.name}</div>
                                    <div className="text-caption text-on-surface-variant mt-0.5">{product.meta}</div>
                                </td>
                                <td className="py-space-md px-space-lg font-label-md">{product.price}</td>
                                <td className="py-space-md px-space-lg text-center">
                                    {product.onSale ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-label-sm bg-primary text-on-primary">판매중</span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-label-sm bg-surface-container-high text-on-surface-variant border border-outline-variant">판매중지</span>
                                    )}
                                </td>
                                <td className="py-space-md px-space-lg text-body-sm text-on-surface-variant">{product.createdAt}</td>
                                <td className="py-space-md px-space-lg text-right space-x-space-xs">
                                    <Link href={ROUTES.sellerProductNew} className="inline-block px-space-sm py-1 bg-surface-container-high text-on-surface rounded text-caption hover:bg-surface-container-highest transition-all">수정</Link>
                                    {product.onSale ? (
                                        <button className="px-space-sm py-1 bg-surface-container-high text-on-surface rounded text-caption hover:bg-surface-container-highest transition-all">내림</button>
                                    ) : (
                                        <button className="px-space-sm py-1 bg-primary text-on-primary rounded text-caption hover:opacity-90 transition-all">재판매</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination Footer */}
                <div className="px-space-lg py-space-md bg-surface-container-low border-t border-surface-variant flex items-center justify-between">
                    <div className="text-body-sm text-on-surface-variant">
                        총 <span className="font-label-md text-on-surface">24개</span>의 상품 중 <span className="font-label-md text-on-surface">1-4개</span> 표시 중
                    </div>
                    <div className="flex items-center gap-space-xs">
                        <button className="w-8 h-8 rounded border border-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50" disabled>
                            <Icon name="chevron_left" className="text-[16px]" />
                        </button>
                        <button className="w-8 h-8 rounded bg-primary text-on-primary font-label-sm flex items-center justify-center">1</button>
                        <button className="w-8 h-8 rounded border border-surface-variant font-label-sm text-on-surface hover:bg-surface-container-high flex items-center justify-center">2</button>
                        <button className="w-8 h-8 rounded border border-surface-variant font-label-sm text-on-surface hover:bg-surface-container-high flex items-center justify-center">3</button>
                        <button className="w-8 h-8 rounded border border-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high">
                            <Icon name="chevron_right" className="text-[16px]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
