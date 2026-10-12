import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import OptionTable from './_components/OptionTable';

export const metadata: Metadata = { title: '판매글 등록 및 수정 | TEAMBUY' };

const EDITOR_TOOLS = ['format_bold', 'format_italic', 'format_underlined'];
const EDITOR_TOOLS_2 = ['format_list_bulleted', 'image'];

export default function SellerProductNewPage() {
    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto px-space-xl py-space-xl space-y-space-xl">
            {/* Top Navigation/Header Context */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-space-xs">
                    <div className="text-caption text-on-surface-variant uppercase tracking-wider">SELLER CENTER / PRODUCT MANAGEMENT</div>
                    <h1 className="text-headline-lg font-headline-lg text-on-surface">판매글 등록 및 수정</h1>
                </div>
                <div className="flex items-center gap-space-md">
                    <button className="h-11 px-space-lg rounded bg-surface-container-high text-on-surface font-label-md hover:bg-surface-variant transition-colors flex items-center gap-space-sm" type="button">
                        <Icon name="visibility" className="text-[18px]" />
                        미리보기
                    </button>
                    <button className="h-11 px-space-lg rounded bg-primary text-on-primary font-label-md hover:opacity-90 transition-opacity flex items-center gap-space-sm" type="button">
                        <Icon name="save" className="text-[18px]" />
                        임시저장
                    </button>
                </div>
            </div>
            {/* Main Form Container */}
            <form className="grid grid-cols-1 lg:grid-cols-3 gap-space-xl">
                {/* Left & Center Columns (Main Details) */}
                <div className="lg:col-span-2 space-y-space-xl">
                    {/* Basic Information Section */}
                    <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/30 space-y-space-lg">
                        <div className="border-b border-outline-variant/30 pb-space-md">
                            <h2 className="text-headline-sm font-headline-sm text-on-surface">기본 정보</h2>
                            <p className="text-body-sm text-on-surface-variant">상품의 기본 제목, 카테고리 및 종목을 설정합니다.</p>
                        </div>
                        <div className="space-y-space-lg">
                            <div className="flex flex-col space-y-space-xs">
                                <label className="text-body-sm font-label-sm text-on-surface">
                                    판매글 제목 <span className="text-error">*</span>
                                </label>
                                <input className="h-[42px] px-space-md bg-surface border border-outline-variant rounded text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors" placeholder="예: 2024시즌 프로팀 단체 유니폼 공동구매" type="text" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                                <div className="flex flex-col space-y-space-xs">
                                    <label className="text-body-sm font-label-sm text-on-surface">
                                        카테고리 선택 <span className="text-error">*</span>
                                    </label>
                                    <select className="h-[42px] px-space-md bg-surface border border-outline-variant rounded text-on-surface focus:border-primary focus:outline-none transition-colors" defaultValue="">
                                        <option value="">카테고리를 선택하세요</option>
                                        <option value="uniform">유니폼 / 의류</option>
                                        <option value="equipment">운동 용품</option>
                                        <option value="shoes">신발 / 보호구</option>
                                        <option value="accessories">단체 액세서리</option>
                                    </select>
                                </div>
                                <div className="flex flex-col space-y-space-xs">
                                    <label className="text-body-sm font-label-sm text-on-surface">
                                        종목 선택 <span className="text-error">*</span>
                                    </label>
                                    <select className="h-[42px] px-space-md bg-surface border border-outline-variant rounded text-on-surface focus:border-primary focus:outline-none transition-colors" defaultValue="">
                                        <option value="">종목을 선택하세요</option>
                                        <option value="soccer">축구 / 풋살</option>
                                        <option value="basketball">농구</option>
                                        <option value="baseball">야구</option>
                                        <option value="badminton">배드민턴 / 테니스</option>
                                        <option value="running">러닝 / 육상</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-space-xs">
                                <label className="text-body-sm font-label-sm text-on-surface">
                                    기본 가격 (KRW) <span className="text-error">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <input className="w-full h-[42px] pl-space-md pr-12 bg-surface border border-outline-variant rounded text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors" placeholder="0" type="text" />
                                    <span className="absolute right-4 text-body-sm text-on-surface-variant font-label-sm">원</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Detailed Description Section */}
                    <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/30 space-y-space-lg">
                        <div className="border-b border-outline-variant/30 pb-space-md">
                            <h2 className="text-headline-sm font-headline-sm text-on-surface">상세 설명</h2>
                            <p className="text-body-sm text-on-surface-variant">상품의 상세 스펙, 사이즈 가이드 및 주의사항을 입력하세요.</p>
                        </div>
                        <div className="flex flex-col space-y-space-xs">
                            <div className="flex items-center justify-between border border-outline-variant border-b-0 rounded-t bg-surface-container px-space-md py-space-xs">
                                <div className="flex items-center gap-space-md text-on-surface-variant">
                                    {EDITOR_TOOLS.map((tool) => (
                                        <button key={tool} className="p-1 hover:text-on-surface transition-colors" type="button">
                                            <Icon name={tool} className="text-[18px]" />
                                        </button>
                                    ))}
                                    <div className="w-[1px] h-4 bg-outline-variant" />
                                    {EDITOR_TOOLS_2.map((tool) => (
                                        <button key={tool} className="p-1 hover:text-on-surface transition-colors" type="button">
                                            <Icon name={tool} className="text-[18px]" />
                                        </button>
                                    ))}
                                </div>
                                <span className="text-caption text-outline">Markdown / HTML Supported</span>
                            </div>
                            <textarea className="w-full p-space-md bg-surface border border-outline-variant rounded-b text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors resize-y" placeholder="상세 내용을 입력하세요..." rows={8} />
                        </div>
                    </div>
                    {/* Option Matrix Table Section */}
                    <OptionTable />
                </div>
                {/* Right Column (Image Upload Area & Quick Actions) */}
                <div className="space-y-space-xl">
                    <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/30 space-y-space-lg sticky top-24">
                        <div className="border-b border-outline-variant/30 pb-space-md">
                            <h2 className="text-headline-sm font-headline-sm text-on-surface">이미지 업로드</h2>
                            <p className="text-body-sm text-on-surface-variant">대표 상품 이미지를 등록하세요. (최대 5장)</p>
                        </div>
                        <div className="flex flex-col space-y-space-md">
                            {/* Main Image Dropzone */}
                            <div className="relative w-full aspect-square border-2 border-dashed border-outline-variant rounded-xl bg-surface flex flex-col items-center justify-center p-space-lg text-center hover:border-primary transition-colors cursor-pointer group">
                                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-space-sm group-hover:bg-primary group-hover:text-on-primary transition-colors">
                                    <Icon name="add_a_photo" className="text-[24px]" />
                                </div>
                                <span className="text-label-md text-on-surface mb-space-xs">대표 이미지 업로드</span>
                                <span className="text-caption text-outline">DRAG &amp; DROP OR BROWSE (1000x1000 권장)</span>
                            </div>
                            {/* Sub Image Thumbnails Grid */}
                            <div className="grid grid-cols-4 gap-space-sm">
                                {[1, 2, 3, 4].map((slot) => (
                                    <div key={slot} className="aspect-square bg-surface border border-outline-variant rounded flex items-center justify-center text-outline cursor-pointer hover:border-primary">
                                        <Icon name="add" className="text-[20px]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Submit & Cancel Actions */}
                        <div className="pt-space-md border-t border-outline-variant/30 flex flex-col gap-space-sm">
                            <button className="w-full h-12 bg-primary text-on-primary rounded font-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-space-sm" type="submit">
                                <Icon name="check" className="text-[18px]" />
                                저장 및 등록 완료
                            </button>
                            <Link href={ROUTES.sellerProducts} className="w-full h-12 bg-surface border border-outline-variant text-on-surface rounded font-label-md hover:bg-surface-container transition-colors flex items-center justify-center gap-space-sm">
                                취소
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
