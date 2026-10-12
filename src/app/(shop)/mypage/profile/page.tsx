import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import { ROUTES } from '@/lib/routes';
import WithdrawalButton from './_components/WithdrawalButton';

export const metadata: Metadata = {
    title: '회원정보 수정 | TEAMBUY',
};

const INPUT_CLASS =
    'h-[42px] px-space-md border border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm rounded focus:border-primary outline-none';
const LABEL_CLASS = 'font-body-sm text-body-sm text-on-surface font-medium mb-1';

const PASSWORD_FIELDS = [
    { id: 'current-password', label: '현재 비밀번호', placeholder: '[ 입력 필요 ]' },
    { id: 'new-password', label: '새 비밀번호', placeholder: '[ 영문, 숫자, 특수문자 조합 8자 이상 ]' },
    { id: 'new-password-confirm', label: '새 비밀번호 확인', placeholder: '[ 재입력 ]' },
];

export default function ProfilePage() {
    return (
        <div className="flex flex-col w-full">
            <div className="max-w-[1200px] mx-auto w-full px-gutter py-space-xl">
                {/* Breadcrumb / Header caption */}
                <div className="flex items-center gap-space-xs font-caption text-caption text-outline mb-space-lg uppercase">
                    <Link className="hover:text-on-surface" href={ROUTES.myPage}>
                        마이페이지
                    </Link>
                    <span>/</span>
                    <span className="text-on-surface font-bold">회원정보 수정 및 관리</span>
                </div>

                <div className="grid grid-cols-12 gap-gutter items-start">
                    {/* Left Sidebar (3 columns) */}
                    <div className="col-span-3 flex flex-col gap-space-md">
                        <MyPageSidebar />
                        <div className="bg-surface-container-low border border-outline-variant rounded p-space-md">
                            <div className="font-label-sm text-label-sm text-on-surface font-bold mb-space-xs">고객센터 안내</div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                                정보 수정 및 탈퇴 관련 문의사항은 고객센터를 이용해주세요.
                            </div>
                            <Link
                                className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-primary underline"
                                href={ROUTES.inquiries}
                            >
                                <span>1:1 문의 바로가기</span>
                                <Icon name="arrow_outward" className="text-[14px]" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Content (9 columns) */}
                    <div className="col-span-9 flex flex-col gap-space-xl">
                        {/* Member Info Edit Form Container */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-xl">
                            <div className="flex items-center justify-between pb-space-md border-b border-surface-container mb-space-xl">
                                <div>
                                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">회원정보 수정</h2>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                                        계정 정보, 비밀번호 및 연락처 정보를 안전하게 관리하세요.
                                    </p>
                                </div>
                                <span className="font-caption text-caption px-space-sm py-1 bg-surface-container border border-outline-variant text-on-surface-variant">
                                    최근 수정: 2025-01-15
                                </span>
                            </div>
                            <form className="flex flex-col gap-space-lg">
                                <div className="grid grid-cols-2 gap-gutter">
                                    <div className="flex flex-col">
                                        <label className={LABEL_CLASS} htmlFor="profile-email">
                                            아이디 (이메일)
                                        </label>
                                        <input
                                            className="h-[42px] px-space-md border border-outline-variant bg-surface-container text-outline font-body-sm rounded cursor-not-allowed"
                                            disabled
                                            id="profile-email"
                                            type="text"
                                            defaultValue="black_tiger_admin@teambuy.kr"
                                        />
                                        <span className="font-caption text-caption text-outline mt-1">아이디는 변경할 수 없습니다.</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className={LABEL_CLASS} htmlFor="profile-team">
                                            팀명 / 단체명
                                        </label>
                                        <input className={INPUT_CLASS} id="profile-team" type="text" defaultValue="FC 블랙 타이거" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-gutter">
                                    <div className="flex flex-col">
                                        <label className={LABEL_CLASS} htmlFor="profile-name">
                                            담당자 성명
                                        </label>
                                        <input className={INPUT_CLASS} id="profile-name" type="text" defaultValue="김철수" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className={LABEL_CLASS} htmlFor="profile-phone">
                                            휴대폰 번호
                                        </label>
                                        <div className="flex gap-space-xs">
                                            <input className={`w-full ${INPUT_CLASS}`} id="profile-phone" type="text" defaultValue="010-9876-5432" />
                                            <button
                                                className="h-[42px] px-space-md border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm whitespace-nowrap rounded"
                                                type="button"
                                            >
                                                인증
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-space-md border-t border-surface-container">
                                    <div className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">비밀번호 변경</div>
                                    <div className="grid grid-cols-3 gap-gutter">
                                        {PASSWORD_FIELDS.map((field) => (
                                            <div key={field.id} className="flex flex-col">
                                                <label className={LABEL_CLASS} htmlFor={field.id}>
                                                    {field.label}
                                                </label>
                                                <input className={INPUT_CLASS} id={field.id} placeholder={field.placeholder} type="password" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-space-md border-t border-surface-container">
                                    <div className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">배송지 관리</div>
                                    <div className="flex flex-col gap-space-sm">
                                        <div className="flex items-center justify-between p-space-md border border-outline-variant bg-surface-container-low rounded">
                                            <div>
                                                <div className="flex items-center gap-space-xs mb-1">
                                                    <span className="font-label-sm text-label-sm text-on-surface font-bold">기본 배송지</span>
                                                    <span className="px-1 bg-primary text-on-primary font-caption text-caption">DEFAULT</span>
                                                </div>
                                                <div className="font-body-sm text-body-sm text-on-surface-variant">
                                                    [06234] 서울특별시 강남구 테헤란로 152, 강남파이낸스센터 12층 체육회실
                                                </div>
                                            </div>
                                            <Link
                                                className="px-space-md py-1.5 border border-outline-variant bg-surface hover:bg-surface-container font-label-sm text-label-sm text-on-surface rounded"
                                                href={ROUTES.addresses}
                                            >
                                                수정
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-space-sm pt-space-md">
                                    <button
                                        className="h-[44px] px-space-xl border border-outline-variant bg-surface hover:bg-surface-container text-on-surface font-label-md rounded transition-colors"
                                        type="reset"
                                    >
                                        취소
                                    </button>
                                    <button
                                        className="h-[44px] px-space-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md rounded transition-colors"
                                        type="button"
                                    >
                                        변경사항 저장
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Seller Registration & Management */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-xl flex flex-col gap-space-lg">
                            <div className="flex items-center justify-between pb-space-md border-b border-surface-container">
                                <div>
                                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-space-xs">
                                        <Icon name="storefront" className="text-[20px]" />
                                        판매자 등록 및 관리
                                    </h3>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                                        자체 제작 유니폼 및 스포츠 장비를 등록하고 판매자 센터를 통해 주문과 정산을 관리할 수 있습니다.
                                    </p>
                                </div>
                                <div className="flex items-center gap-space-xs">
                                    <span className="font-caption text-caption text-outline">회원 권한 상태:</span>
                                    <span className="font-label-sm text-label-sm px-space-sm py-0.5 bg-surface-container border border-outline-variant text-on-surface font-medium rounded">
                                        일반 회원 (판매자 미등록)
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-gutter">
                                <div className="p-space-md border border-outline-variant bg-surface-container-low rounded flex flex-col justify-between gap-space-md">
                                    <div>
                                        <div className="flex items-center gap-space-xs mb-space-xs">
                                            <Icon name="how_to_reg" className="text-[18px] text-primary" />
                                            <span className="font-label-md text-label-md text-on-surface font-bold">신규 판매자 입점 신청</span>
                                        </div>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                                            사업자등록증 또는 팀 단체 인증 후 공동구매 상품을 직접 등록하고 판매 권한을 획득할 수 있습니다.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-space-xs border-t border-surface-container">
                                        <span className="font-caption text-caption text-outline">심사 소요: 영업일 기준 1~2일</span>
                                        <Link
                                            className="h-[38px] px-space-md bg-primary hover:bg-primary/90 text-on-primary font-label-sm rounded inline-flex items-center gap-space-xs transition-colors"
                                            href={ROUTES.sellerApply}
                                        >
                                            <Icon name="app_registration" className="text-[16px]" />
                                            판매자 등록 신청
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-space-md border border-outline-variant bg-surface-container-low rounded flex flex-col justify-between gap-space-md">
                                    <div>
                                        <div className="flex items-center gap-space-xs mb-space-xs">
                                            <Icon name="admin_panel_settings" className="text-[18px] text-outline" />
                                            <span className="font-label-md text-label-md text-on-surface font-bold">판매자 센터 (파트너 콘솔)</span>
                                        </div>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                                            등록 승인 후 활성화되는 대시보드로 실시간 주문 접수, 로스터 검수, 송장 등록 및 정산 관리가 가능합니다.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-space-xs border-t border-surface-container">
                                        <span className="font-caption text-caption text-outline">승인 완료 후 접근 가능</span>
                                        <Link
                                            className="h-[38px] px-space-md border border-outline-variant bg-surface hover:bg-surface-container text-on-surface font-label-sm rounded inline-flex items-center gap-space-xs transition-colors"
                                            href={ROUTES.seller}
                                        >
                                            <Icon name="open_in_new" className="text-[16px]" />
                                            판매자 센터 바로가기
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Deletion Area (회원 탈퇴) */}
                        <div className="bg-surface-container-lowest border border-error/50 rounded p-space-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-error" />
                            <div className="flex items-start justify-between pb-space-md border-b border-surface-container mb-space-md">
                                <div>
                                    <h3 className="font-headline-md text-headline-md text-error font-bold flex items-center gap-space-xs">
                                        <Icon name="warning" />
                                        회원 탈퇴
                                    </h3>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                                        탈퇴 시 팀 예치금 소멸 및 모든 구매/로스터 데이터가 삭제되며 복구할 수 없습니다.
                                    </p>
                                </div>
                            </div>
                            {/* Warning Box for Active Group Orders & Deposits */}
                            <div className="bg-error-container/20 border border-error/30 rounded p-space-md mb-space-lg flex items-start gap-space-md">
                                <Icon name="block" className="text-error text-[24px]" />
                                <div className="flex flex-col gap-space-xs">
                                    <span className="font-label-sm text-label-sm text-error font-bold">
                                        [회원 탈퇴 제한 안내] 진행 중인 공동구매 및 동결 예치금이 존재합니다.
                                    </span>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                                        현재 <strong className="text-on-surface font-semibold">2건의 공동구매</strong>가 진행 중이며,{' '}
                                        <strong className="text-on-surface font-semibold">₩2,450,000원의 팀 예치금</strong>이 남아있습니다. 탈퇴를
                                        진행하시려면 모든 공동구매 종료 후 예치금을 환불 신청하시거나 잔액을 0원으로 정산해야 합니다.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-space-xs font-caption text-caption text-outline">
                                    <Icon name="info" className="text-[16px]" />
                                    <span>탈퇴 관련 약관 및 환불 규정은 고객센터 FAQ를 참고해주세요.</span>
                                </div>
                                <WithdrawalButton />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
