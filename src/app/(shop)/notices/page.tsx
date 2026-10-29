import type { Metadata } from 'next';
import NoticeBoard from './_components/NoticeBoard';

export const metadata: Metadata = { title: '공지사항 | TEAMBUY' };

export default function NoticesPage() {
    return (
        <div className="flex flex-col w-full max-w-[1200px] mx-auto px-gutter py-space-xl">
            <NoticeBoard />
        </div>
    );
}