import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import InquiryComposer from './_components/InquiryComposer';
import InquiryList, { type Inquiry } from './_components/InquiryList';

export const metadata: Metadata = {
    title: '1:1 문의 | TEAMBUY',
};

const INQUIRIES: Inquiry[] = [
    {
        id: 'item-1',
        answered: true,
        type: '로스터 커스텀',
        title: 'FC아스날 등번호 마킹 폰트 변경 가능한가요?',
        date: '2025.03.28',
        question: '기존에 등록된 폰트 외에 구단 자체 폰트로 등번호 마킹 인쇄가 가능한지 문의드립니다. 로스터 파일은 AI 파일로 준비되어 있습니다.',
        answer: '안녕하세요 TEAMBUY 고객센터입니다. 올려주신 AI 파일 확인 결과, 커스텀 폰트 마킹 작업이 가능합니다. 주문 시 요청사항란에 해당 폰트 적용을 기재해 주시면 시안 확인 후 작업 진행 도와드리겠습니다. 감사합니다.',
        answeredAt: '2025.03.29 14:20',
    },
    {
        id: 'item-2',
        answered: false,
        type: '공동구매 개설',
        title: '축구화 MOQ 20족 달성 시 추가 할인 적용 문의',
        date: '2025.03.30',
        question:
            '현재 개설한 공동구매 건이 참여 인원 15명을 넘어 20명을 향해가고 있습니다. 20족 달성 시 3단계 할인율(15% OFF)이 즉시 적용되는지, 아니면 마감 후 정산되는지 궁금합니다.',
    },
    {
        id: 'item-3',
        answered: true,
        type: '결제 / 예치금',
        title: '팀 예치금 충전 가상계좌 입금 확인 요청',
        date: '2025.03.25',
        question: '오늘 오전 신한은행 가상계좌로 500,000원 입금 완료했는데 아직 마이페이지 예치금에 반영되지 않았습니다. 확인 부탁드립니다.',
        answer: '안녕하세요. 입금자명이 달라서 수동 확인이 필요했습니다. 확인 후 정상적으로 예치금 500,000원 충전 완료 처리되었습니다. 이용에 불편을 드려 죄송합니다.',
        answeredAt: '2025.03.25 11:05',
    },
    {
        id: 'item-4',
        answered: false,
        type: '배송 / 샘플',
        title: '농구 유니폼 사이즈 샘플 키트 대여 신청 건',
        date: '2025.03.24',
        question: '팀원들과 사이즈 피팅을 위해 샘플 키트 신청했는데 출고일정이 언제쯤 될까요?',
    },
];

export default function InquiriesPage() {
    return (
        <div className="flex flex-col w-full max-w-[1200px] mx-auto px-gutter py-space-xl">
            <InquiryComposer />

            {/* Inquiry List Section */}
            <div className="flex flex-col gap-space-md">
                <InquiryList inquiries={INQUIRIES} />

                {/* Pagination */}
                <div className="flex items-center justify-center gap-space-xs py-space-md">
                    <button
                        className="w-9 h-9 border border-outline-variant rounded flex items-center justify-center text-outline hover:border-primary hover:text-on-surface transition-colors"
                        disabled
                        type="button"
                    >
                        <Icon name="chevron_left" className="text-[18px]" />
                    </button>
                    <button className="w-9 h-9 border border-primary bg-primary text-on-primary font-label-sm rounded flex items-center justify-center" type="button">
                        1
                    </button>
                    <button
                        className="w-9 h-9 border border-outline-variant rounded font-label-sm text-on-surface-variant flex items-center justify-center hover:border-primary hover:text-on-surface transition-colors"
                        type="button"
                    >
                        2
                    </button>
                    <button
                        className="w-9 h-9 border border-outline-variant rounded flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-on-surface transition-colors"
                        type="button"
                    >
                        <Icon name="chevron_right" className="text-[18px]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
