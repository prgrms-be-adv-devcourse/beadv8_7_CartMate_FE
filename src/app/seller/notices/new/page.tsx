import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import NoticeScopeSelect from './_components/NoticeScopeSelect';

export const metadata: Metadata = { title: '판매자 공지 작성 | TEAMBUY' };

const EDITOR_GROUPS = [
    [
        { icon: 'format_bold', title: '굵게' },
        { icon: 'format_italic', title: '기울임' },
        { icon: 'format_underlined', title: '밑줄' },
    ],
    [
        { icon: 'format_list_bulleted', title: '글머리 기호' },
        { icon: 'format_list_numbered', title: '번호 매기기' },
    ],
    [
        { icon: 'link', title: '링크 삽입' },
        { icon: 'image', title: '이미지 삽입' },
    ],
];

export default function SellerNoticeNewPage() {
    return (
        <div className="flex flex-col w-full max-w-5xl mx-auto pb-space-xl">
            <div className="flex items-center justify-between mb-space-xl">
                <div>
                    <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">판매자 공지 작성</h1>
                    <p className="text-body-md text-on-surface-variant mt-space-xs">그룹 구매 참여자들에게 전달할 새로운 공지사항을 등록합니다.</p>
                </div>
                <div className="flex items-center gap-space-sm">
                    <span className="px-space-md py-space-xs bg-surface-container-high text-on-surface text-caption rounded-full">모노크롬 와이어프레임 모드</span>
                </div>
            </div>
            <form className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm border border-outline-variant/30 flex flex-col gap-space-xl" id="notice-form">
                <div className="flex flex-col gap-space-xs">
                    <label className="text-label-md font-label-md text-on-surface" htmlFor="notice-title">
                        공지 제목 <span className="text-error">*</span>
                    </label>
                    <input className="h-[42px] px-space-md bg-surface border border-outline-variant rounded text-on-surface placeholder:text-outline focus:border-on-surface focus:outline-none transition-all text-body-md" id="notice-title" placeholder="제목을 입력하세요 (예: [안내] 3차 배송 일정 변경의 건)" required type="text" />
                </div>
                <NoticeScopeSelect />
                <div className="grid grid-cols-2 gap-space-lg">
                    <div className="flex flex-col gap-space-xs">
                        <label className="text-label-md font-label-md text-on-surface" htmlFor="start-date">
                            게시 시작일시 <span className="text-error">*</span>
                        </label>
                        <input className="h-[42px] px-space-md bg-surface border border-outline-variant rounded text-on-surface focus:border-on-surface focus:outline-none text-body-md" id="start-date" required type="datetime-local" />
                    </div>
                    <div className="flex flex-col gap-space-xs">
                        <label className="text-label-md font-label-md text-on-surface" htmlFor="end-date">
                            게시 종료일시 <span className="text-error">*</span>
                        </label>
                        <input className="h-[42px] px-space-md bg-surface border border-outline-variant rounded text-on-surface focus:border-on-surface focus:outline-none text-body-md" id="end-date" required type="datetime-local" />
                    </div>
                </div>
                <div className="flex flex-col gap-space-xs">
                    <label className="text-label-md font-label-md text-on-surface">
                        공지 내용 <span className="text-error">*</span>
                    </label>
                    <div className="border border-outline-variant rounded bg-surface overflow-hidden">
                        <div className="flex items-center gap-space-xs p-space-sm bg-surface-container-high border-b border-outline-variant text-on-surface-variant">
                            {EDITOR_GROUPS.map((group, groupIndex) => (
                                <div key={groupIndex} className="contents">
                                    {groupIndex > 0 && <div className="w-[1px] h-4 bg-outline-variant mx-space-xs" />}
                                    {group.map((tool) => (
                                        <button key={tool.icon} className="p-space-xs hover:bg-surface-container rounded" title={tool.title} type="button">
                                            <Icon name={tool.icon} className="text-[18px]" />
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <textarea className="w-full p-space-md bg-surface text-on-surface placeholder:text-outline focus:outline-none resize-y text-body-md" placeholder="공지 내용을 입력하세요..." required rows={10} />
                    </div>
                </div>
                <div className="flex items-center justify-between pt-space-md border-t border-outline-variant/30">
                    <Link href={ROUTES.seller} className="px-space-xl h-[44px] bg-surface border border-outline-variant text-on-surface rounded text-label-md font-label-md hover:bg-surface-container transition-colors flex items-center">
                        취소
                    </Link>
                    <button className="px-space-xl h-[44px] bg-primary text-on-primary rounded text-label-md font-label-md hover:opacity-90 transition-opacity flex items-center gap-space-xs" type="submit">
                        <Icon name="check" className="text-[18px]" />
                        등록하기
                    </button>
                </div>
            </form>
        </div>
    );
}
