'use client';

import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import Icon from '@/components/ui/Icon';
import FilledIcon from './FilledIcon';

export type Notice = {
    no: number;
    category: '공지' | '안내' | '이벤트';
    title: string;
    pinned: boolean;
    author: string;
    createdAt: string;
    content: string;
};

const CATEGORY_CLASS: Record<Notice['category'], string> = {
    공지: 'inline-flex px-2 py-0.5 rounded bg-primary text-on-primary font-caption text-caption',
    안내: 'inline-flex px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-caption',
    이벤트: 'inline-flex px-2 py-0.5 rounded bg-surface-variant text-on-surface font-caption text-caption font-semibold',
};

const CATEGORY_OPTIONS = [
    { value: '공지', label: '[공지] 기본 일반 공지' },
    { value: '안내', label: '[안내] 서비스 점검 및 기능' },
    { value: '이벤트', label: '[이벤트] 프로모션 및 혜택' },
    { value: '긴급', label: '[긴급] 비상 대기 안내' },
];

const TOOLBAR = [
    [
        { icon: 'format_bold', title: '굵게' },
        { icon: 'format_italic', title: '기울임' },
        { icon: 'format_underlined', title: '밑줄' },
    ],
    [
        { icon: 'format_list_numbered', title: '목록 (번호)' },
        { icon: 'format_list_bulleted', title: '목록 (불릿)' },
    ],
    [
        { icon: 'link', title: '링크 삽입' },
        { icon: 'image', title: '이미지 첨부' },
    ],
];

type Mode = 'default' | 'new' | 'edit';

const EDITOR_TITLE: Record<Mode, string> = {
    default: '공지사항 작성 / 수정',
    new: '공지사항 작성',
    edit: '공지사항 수정',
};

const ROW_BG = ['bg-surface-container-low/40', 'bg-surface-container-low/20'];

// 공지사항 목록 + 작성/수정 에디터 (행 선택 시 에디터에 내용 채움)
// children 으로 받은 정적 요약 카드 영역은 상단 헤더와 목록 사이에 렌더링된다.
export default function NoticeManager({ notices, children }: { notices: Notice[]; children: ReactNode }) {
    const editorRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<Mode>('default');
    const [category, setCategory] = useState('공지');
    const [pinned, setPinned] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const focusEditor = () => {
        editorRef.current?.scrollIntoView({ behavior: 'smooth' });
        titleInputRef.current?.focus();
    };

    const openNewEditor = () => {
        setMode('new');
        setTitle('');
        setContent('');
        setPinned(false);
        focusEditor();
    };

    const fillNoticeForm = (notice: Notice) => {
        setMode('edit');
        setCategory(notice.category);
        setTitle(notice.title);
        setContent(notice.content);
        setPinned(notice.pinned);
        focusEditor();
    };

    const resetForm = () => {
        setMode('default');
        setCategory('공지');
        setTitle('');
        setContent('');
        setPinned(false);
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const confirmDelete = (no: number) => {
        if (confirm(`[번호: ${no}] 해당 공지사항을 영구 삭제하시겠습니까?`)) {
            alert(`공지사항 #${no} 이(가) 성공적으로 삭제되었습니다.`);
        }
    };

    const previewNotice = () => {
        if (!title) {
            alert('제목을 먼저 입력해 주세요.');
            return;
        }
        alert(`[미리보기]\n제목: ${title}\n상단고정: ${pinned ? '예' : '아니오'}`);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert(`"${title}" 공지사항이 정상적으로 저장되었습니다.`);
        scrollToTop();
    };

    return (
        <>
            {/* Top Action & Statistics Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md p-space-lg rounded-xl bg-surface-container-lowest shadow-sm">
                <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center gap-space-sm">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-primary text-on-primary">
                            <Icon name="campaign" className="text-[18px]" />
                        </span>
                        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">공지사항 관리</h1>
                        <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">WIREFRAME CONSOLE</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        서비스 전체 공지사항을 등록하고 상단 고정 여부를 설정합니다. 변경 사항은 플랫폼 전역에 즉시 반영됩니다.
                    </p>
                </div>
                <div className="flex items-center gap-space-sm">
                    <button
                        className="flex items-center gap-space-xs px-space-lg py-2.5 rounded bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-all shadow-sm"
                        type="button"
                        onClick={openNewEditor}
                    >
                        <Icon name="add_circle" className="text-[18px]" />
                        <span>+ 새 공지사항 작성</span>
                    </button>
                </div>
            </div>
            {children}
            {/* Part 1: Notice Table Container */}
            <div className="flex flex-col bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
                {/* Table Filter and Context Bar */}
                <div className="p-space-md bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-sm">
                        <span className="font-label-md text-label-md text-primary">공지 목록</span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest font-caption text-caption text-on-surface-variant">총 12건 표시</span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                        <div className="flex items-center px-space-sm py-1.5 rounded bg-surface-container-lowest shadow-sm gap-space-xs">
                            <Icon name="search" className="text-[18px] text-outline" />
                            <input
                                className="font-body-sm text-body-sm text-primary bg-transparent focus:outline-none w-48 md:w-64 placeholder:text-outline-variant"
                                placeholder="제목, 내용 또는 작성자 검색"
                                type="text"
                            />
                        </div>
                        <button className="p-2 rounded bg-surface-container-lowest text-primary hover:bg-surface-container transition-colors shadow-sm" type="button">
                            <Icon name="tune" className="text-[18px]" />
                        </button>
                    </div>
                </div>
                {/* Modern Wireframe Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-body-sm text-body-sm text-on-surface">
                        <thead className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm tracking-wider uppercase">
                            <tr>
                                <th className="py-space-sm px-space-md w-16 text-center" scope="col">번호</th>
                                <th className="py-space-sm px-space-md w-24 text-center" scope="col">구분</th>
                                <th className="py-space-sm px-space-md" scope="col">제목</th>
                                <th className="py-space-sm px-space-md w-32 text-center" scope="col">상단 고정</th>
                                <th className="py-space-sm px-space-md w-32" scope="col">작성자</th>
                                <th className="py-space-sm px-space-md w-32" scope="col">작성일</th>
                                <th className="py-space-sm px-space-md w-36 text-center" scope="col">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-none">
                            {notices.map((notice, index) => (
                                <tr
                                    key={notice.no}
                                    className={`hover:bg-surface-container-low transition-colors${notice.pinned && ROW_BG[index] ? ` ${ROW_BG[index]}` : ''}`}
                                >
                                    <td
                                        className={`py-space-md px-space-md text-center font-label-sm text-label-sm ${notice.pinned ? 'text-primary' : 'text-secondary'}`}
                                    >
                                        {notice.no}
                                    </td>
                                    <td className="py-space-md px-space-md text-center">
                                        <span className={CATEGORY_CLASS[notice.category]}>{notice.category}</span>
                                    </td>
                                    <td className="py-space-md px-space-md">
                                        {notice.pinned ? (
                                            <div
                                                className="flex items-center gap-space-xs font-label-md text-label-md text-primary cursor-pointer hover:underline"
                                                onClick={() => fillNoticeForm(notice)}
                                            >
                                                <FilledIcon name="push_pin" className="text-[16px] text-primary" />
                                                <span>{notice.title}</span>
                                            </div>
                                        ) : (
                                            <span
                                                className="font-body-md text-body-md text-primary cursor-pointer hover:underline"
                                                onClick={() => fillNoticeForm(notice)}
                                            >
                                                {notice.title}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-space-md px-space-md text-center">
                                        {notice.pinned ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold">
                                                <FilledIcon name="star" className="text-[12px]" />
                                                <span>고정됨</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption">
                                                일반
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-space-md px-space-md font-body-sm text-body-sm text-on-surface">{notice.author}</td>
                                    <td className="py-space-md px-space-md font-caption text-caption text-on-surface-variant">{notice.createdAt}</td>
                                    <td className="py-space-md px-space-md text-center">
                                        <div className="flex items-center justify-center gap-space-xs">
                                            <button
                                                className="px-2.5 py-1 rounded bg-surface-container text-primary font-label-sm text-label-sm hover:bg-surface-container-high transition-colors"
                                                type="button"
                                                onClick={() => fillNoticeForm(notice)}
                                            >
                                                수정
                                            </button>
                                            <button
                                                className="px-2.5 py-1 rounded bg-error-container text-on-error-container font-label-sm text-label-sm hover:opacity-90 transition-colors"
                                                type="button"
                                                onClick={() => confirmDelete(notice.no)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Container */}
                <div className="p-space-md bg-surface-container-lowest flex items-center justify-between">
                    <span className="font-caption text-caption text-on-surface-variant">1-4 of 12 결과 표시</span>
                    <div className="flex items-center gap-space-xs">
                        <button
                            className="w-8 h-8 rounded bg-surface-container text-outline hover:text-primary hover:bg-surface-container-high flex items-center justify-center transition-colors"
                            type="button"
                        >
                            <Icon name="chevron_left" className="text-[16px]" />
                        </button>
                        <button className="w-8 h-8 rounded bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center" type="button">
                            1
                        </button>
                        <button
                            className="w-8 h-8 rounded bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-label-sm text-label-sm flex items-center justify-center transition-colors"
                            type="button"
                        >
                            2
                        </button>
                        <button
                            className="w-8 h-8 rounded bg-surface-container text-outline hover:text-primary hover:bg-surface-container-high flex items-center justify-center transition-colors"
                            type="button"
                        >
                            <Icon name="chevron_right" className="text-[16px]" />
                        </button>
                    </div>
                </div>
            </div>
            {/* Part 2: Interactive Editor Panel (Write / Edit) */}
            <div ref={editorRef} className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md transition-all">
                <div className="flex items-center justify-between pb-space-sm">
                    <div className="flex items-center gap-space-sm">
                        <span className="w-2.5 h-6 rounded-full bg-primary inline-block"></span>
                        <h2 className="font-headline-md text-headline-md text-primary">{EDITOR_TITLE[mode]}</h2>
                        <span className="px-2 py-0.5 rounded bg-surface-container-high font-caption text-caption text-on-surface-variant">
                            {mode === 'edit' ? '수정 중' : '신규 등록'}
                        </span>
                    </div>
                    <button className="text-on-surface-variant hover:text-primary flex items-center gap-1 font-label-sm text-label-sm" type="button" onClick={resetForm}>
                        <Icon name="refresh" className="text-[16px]" />
                        <span>입력 초기화</span>
                    </button>
                </div>
                {/* Editor Form */}
                <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
                    {/* Category & Pinned Option Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="notice-category">
                                공지 구분
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full h-[42px] px-3 rounded bg-surface-container-lowest text-primary font-body-sm text-body-sm appearance-none focus:outline-none shadow-sm cursor-pointer pr-10"
                                    id="notice-category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {CATEGORY_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <Icon name="expand_more" className="pointer-events-none absolute right-3 top-2.5 text-outline text-[18px]" />
                            </div>
                        </div>
                        <div className="md:col-span-2 flex flex-col justify-end">
                            {/* Pinned Checkbox Card */}
                            <label className="flex items-center gap-space-sm p-2.5 rounded bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                                <input
                                    className="w-5 h-5 accent-primary cursor-pointer rounded"
                                    id="notice-is-pinned"
                                    type="checkbox"
                                    checked={pinned}
                                    onChange={(e) => setPinned(e.target.checked)}
                                />
                                <div className="flex items-center gap-space-xs">
                                    <FilledIcon name="push_pin" className="text-[18px] text-primary" />
                                    <span className="font-label-md text-label-md text-primary">상단 고정 공지로 등록</span>
                                    <span className="font-caption text-caption text-on-surface-variant">(사용자 화면 공지 목록 최상단에 고정 노출됩니다)</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    {/* Title Input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="notice-title-input">
                            공지 제목
                        </label>
                        <input
                            ref={titleInputRef}
                            className="w-full h-[42px] px-3.5 rounded bg-surface-container-lowest text-primary font-body-md text-body-md placeholder:text-outline-variant focus:outline-none shadow-sm"
                            id="notice-title-input"
                            placeholder="제목을 입력하세요 (예: [안내] 시스템 점검 일정 공지)"
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    {/* Wireframe WYSIWYG Content Area */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="notice-content-input">
                            공지사항 본문 내용
                        </label>
                        {/* Mock Toolbar */}
                        <div className="flex items-center gap-1 p-2 rounded-t bg-surface-container">
                            {TOOLBAR.map((group, groupIndex) => (
                                <div key={groupIndex} className="contents">
                                    {groupIndex > 0 && <span className="w-px h-4 bg-outline-variant mx-1"></span>}
                                    {group.map((tool) => (
                                        <button
                                            key={tool.icon}
                                            className="w-8 h-8 rounded hover:bg-surface-container-high flex items-center justify-center text-primary"
                                            title={tool.title}
                                            type="button"
                                        >
                                            <Icon name={tool.icon} className="text-[18px]" />
                                        </button>
                                    ))}
                                </div>
                            ))}
                            <span className="ml-auto font-caption text-caption text-on-surface-variant">와이어프레임 에디터</span>
                        </div>
                        {/* Textarea */}
                        <textarea
                            className="w-full p-3.5 rounded-b bg-surface-container-lowest text-primary font-body-md text-body-md placeholder:text-outline-variant focus:outline-none shadow-sm resize-y"
                            id="notice-content-input"
                            placeholder="공지사항 본문 내용을 입력하세요. 공동구매 정책, 시스템 점검, 사용자 안내 등 세부 공지 세부사항을 기술합니다..."
                            required
                            rows={7}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-between pt-space-md">
                        <button
                            className="px-space-lg py-2.5 rounded bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                            type="button"
                            onClick={scrollToTop}
                        >
                            저장 취소 후 목록으로
                        </button>
                        <div className="flex items-center gap-space-sm">
                            <button
                                className="px-space-md py-2.5 rounded bg-surface-container-high text-primary font-label-md text-label-md hover:opacity-80 transition-colors"
                                type="button"
                                onClick={previewNotice}
                            >
                                미리보기
                            </button>
                            <button
                                className="px-space-xl py-2.5 rounded bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-all shadow-sm flex items-center gap-space-xs"
                                type="submit"
                            >
                                <Icon name="save" className="text-[18px]" />
                                <span>공지사항 저장</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
