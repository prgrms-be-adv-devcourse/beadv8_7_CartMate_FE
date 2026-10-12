import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import CopyLinkButton from '../../_components/CopyLinkButton';
import Countdown from '../../_components/Countdown';

export const metadata: Metadata = {
    title: '공동구매 초대 | TEAMBUY',
};

const BENEFITS = ['마감 전까지 옵션 및 배송정보 수정 자유', '목표 미달 시 취소 수수료 없이 100% 자동 환불', '개별 결제 및 영수증 독립 발행 지원'];

const SIZE_STATS = [
    { size: 'L', label: 'L (100) 사이즈', width: '50%', count: '4명 (50%)', highlight: true },
    { size: 'M', label: 'M (95) 사이즈', width: '37.5%', count: '3명 (37.5%)', highlight: false },
    { size: 'XL', label: 'XL (105) 사이즈', width: '12.5%', count: '1명 (12.5%)', highlight: false },
];

const REGISTERED_NUMBERS = ['#7 손흥민 (L)', '#10 김철수 (M)', '#9 이강인 (L)', '#4 김민재 (XL)', '#1 조현우 [GK] (L)', '#11 황희찬 (M)', '#6 황인범 (L)', '#8 백승호 (M)'];

export default function GroupPurchaseInvitePage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                <div className="mb-space-lg flex items-center justify-between bg-surface-container-high px-space-md py-space-sm rounded text-on-surface">
                    <div className="flex items-center gap-space-sm">
                        <Icon name="info" className="text-[18px]" />
                        <span className="font-label-sm text-label-sm uppercase tracking-wide">[WIREFRAME VIEW: 화면 3 - 초대 링크 수신자 / 비참여자 시점 (GUEST VIEW)]</span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                        <span className="font-caption text-caption text-secondary">ROOM_ID: #GP-2025-FCACE-089</span>
                        <span className="font-caption text-caption bg-surface text-primary px-2 py-0.5 rounded">비회원/외부초대 접근 허용</span>
                    </div>
                </div>

                <section className="bg-primary text-on-primary p-space-lg rounded mb-space-lg shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                        <div className="space-y-space-xs">
                            <div className="flex items-center gap-space-xs">
                                <span className="bg-on-primary text-primary font-caption text-caption px-2 py-0.5 rounded font-bold">INVITATION</span>
                                <span className="font-caption text-caption text-primary-fixed-dim">팀 공동구매 초대장</span>
                            </div>
                            <h1 className="font-headline-lg text-headline-lg text-on-primary tracking-tight">FC 에이스 팀의 공동구매에 초대되었습니다</h1>
                            <p className="font-body-md text-body-md text-primary-fixed-dim">
                                팀원들과 수량을 합쳐 최대 할인율을 달성하세요. 링크를 통해 본인의 사이즈와 등번호 마킹을 직접 등록할 수 있습니다.
                            </p>
                        </div>
                        <div className="bg-primary-container text-on-primary-container p-space-md rounded min-w-[240px] flex flex-col justify-center">
                            <span className="font-caption text-caption text-primary-fixed-dim uppercase">종목 &amp; 카테고리</span>
                            <span className="font-label-md text-label-md text-on-primary">축구 / 단체 커스텀 매치킷 유니폼</span>
                            <div className="mt-space-xs pt-space-xs flex items-center gap-1 font-caption text-caption text-primary-fixed-dim">
                                <Icon name="verified" className="text-[14px]" />
                                <span>공식 단체 인증 완료</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-surface-container-lowest p-space-xl rounded shadow-sm mb-space-xl">
                    <div className="grid grid-cols-12 gap-gutter items-start">
                        <div className="col-span-12 lg:col-span-8 space-y-space-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-space-md">
                                    <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center text-primary font-headline-sm text-headline-sm">
                                        <Icon name="sports_soccer" className="text-[24px]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-space-xs">
                                            <span className="font-headline-sm text-headline-sm text-on-surface">김철수 (팀장)</span>
                                            <span className="bg-primary text-on-primary font-caption text-caption px-2 py-0.5 rounded font-bold">호스트 (방장)</span>
                                            <span className="bg-surface-container text-secondary font-caption text-caption px-2 py-0.5 rounded">FC 에이스 주장</span>
                                        </div>
                                        <p className="font-body-sm text-body-sm text-secondary">2025 춘계 조기축구 리그 출전 대비 팀 유니폼 공동 오더룸</p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="font-caption text-caption text-secondary">생성 일시</span>
                                    <span className="font-label-sm text-label-sm text-on-surface">2025.11.06 14:20</span>
                                </div>
                            </div>
                            <div className="bg-surface-container-low p-space-md rounded space-y-space-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-space-xs">
                                        <span className="font-label-md text-label-md text-primary">현재 참여 현황</span>
                                        <span className="font-caption text-caption text-secondary">[MOQ 단계: 2단계 달성]</span>
                                    </div>
                                    <div className="font-label-md text-label-md text-primary">
                                        <span className="font-headline-sm text-headline-sm text-primary">8명</span> / 목표 11명{' '}
                                        <span className="text-secondary font-body-sm">(최대 15명)</span>
                                    </div>
                                </div>
                                <div className="w-full bg-surface-variant h-3 rounded-full overflow-hidden relative">
                                    <div className="bg-primary h-full transition-all duration-300" style={{ width: '72.7%' }} />
                                </div>
                                <div className="flex items-center justify-between font-caption text-caption text-secondary pt-1">
                                    <span>최소 수량 달성 (5명 MOQ 통과)</span>
                                    <span className="font-bold text-primary">달성률 72.7% (3명 더 모이면 추가 5% 인하)</span>
                                    <span>최대 정원 15명</span>
                                </div>
                            </div>
                            <div className="bg-surface-container-high p-space-md rounded flex items-start gap-space-sm">
                                <Icon name="campaign" className="text-primary text-[20px] mt-0.5" />
                                <div className="flex-1 space-y-1">
                                    <div className="font-label-sm text-label-sm text-primary font-bold">제안자 전달 메모</div>
                                    <p className="font-body-sm text-body-sm text-on-surface">
                                        &quot;등번호 중복 피해서 기재해주세요! 골키퍼는 형광 킷으로 선택 바랍니다. 배송은 경기장으로 일괄 직배송됩니다.&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-space-lg rounded flex flex-col justify-between h-full">
                            <div className="space-y-space-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">주문 마감 카운트다운</span>
                                    <span className="bg-error text-on-error font-caption text-caption px-1.5 py-0.5 rounded animate-pulse font-bold">마감 임박</span>
                                </div>
                                <div className="bg-surface-container-lowest p-space-md rounded text-center shadow-sm">
                                    <div className="font-caption text-caption text-secondary mb-1">수정 및 참여 마감까지 남은 시간</div>
                                    <Countdown
                                        hours={43}
                                        minutes={17}
                                        seconds={27}
                                        format="korean"
                                        className="block font-headline-lg text-headline-lg text-primary tracking-tight font-mono"
                                    />
                                    <div className="font-caption text-caption text-secondary mt-1">(마감 기준: 11월 8일 18:00 KST)</div>
                                </div>
                                <ul className="font-body-sm text-body-sm text-secondary space-y-1 pt-space-xs">
                                    {BENEFITS.map((benefit) => (
                                        <li key={benefit} className="flex items-center gap-1.5">
                                            <Icon name="check_circle" className="text-[16px]" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="pt-space-md mt-space-md bg-surface-container-highest p-space-sm rounded flex items-center justify-between text-secondary font-caption text-caption">
                                <span>공유 링크 복사</span>
                                <CopyLinkButton
                                    url="https://teambuy.wireframe/join/FCACE-089"
                                    label="URL 복사"
                                    copiedLabel="복사 완료!"
                                    icon="content_copy"
                                    iconClassName="text-[14px]"
                                    copiedClassName=""
                                    className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-12 gap-gutter mb-space-xl">
                    <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest p-space-xl rounded shadow-sm">
                        <div className="flex items-center justify-between mb-space-md pb-space-sm bg-surface-container-low px-space-md py-space-xs rounded">
                            <h2 className="font-headline-sm text-headline-sm text-primary">담긴 상품 및 단체 혜택</h2>
                            <span className="font-caption text-caption bg-surface-container-high text-primary px-2 py-0.5 rounded">단체 커스텀 품목</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-space-lg items-start">
                            <div className="w-full sm:w-[220px] aspect-square bg-surface-container-low rounded relative overflow-hidden flex-shrink-0 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full text-surface-variant" preserveAspectRatio="none" viewBox="0 0 100 100">
                                    <line stroke="currentColor" strokeWidth="1.5" x1="0" x2="100" y1="0" y2="100" />
                                    <line stroke="currentColor" strokeWidth="1.5" x1="100" x2="0" y1="0" y2="100" />
                                </svg>
                                <div className="relative z-10 bg-surface-container-lowest/90 px-space-sm py-1 rounded text-center shadow-sm">
                                    <span className="font-label-sm text-label-sm text-primary block">[ WIREFRAME KIT ]</span>
                                    <span className="font-caption text-caption text-secondary">220 x 220 PX</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-space-md w-full">
                                <div>
                                    <div className="flex items-center gap-space-xs mb-1">
                                        <span className="font-caption text-caption text-secondary">STRIKE-PRO SPORTS</span>
                                        <span className="font-caption text-caption bg-surface-container-highest px-1.5 py-0.5 rounded text-primary">정품 공인 인증</span>
                                    </div>
                                    <h3 className="font-headline-sm text-headline-sm text-on-surface">[2025 공식 매치] 에어로 드라이핏 커스텀 유니폼 세트 (상의+하의+삭스)</h3>
                                    <p className="font-body-sm text-body-sm text-secondary mt-1">선수 번호, 백네임, 엠블럼 실리콘 전사 및 스폰서 로고 마킹 패키지 기본 포함.</p>
                                </div>
                                <div className="bg-surface-container-low p-space-md rounded space-y-space-xs">
                                    <div className="flex items-baseline justify-between">
                                        <span className="font-body-sm text-body-sm text-secondary">단품 정가 (1벌 기준)</span>
                                        <span className="font-body-sm text-body-sm text-secondary line-through">45,000원</span>
                                    </div>
                                    <div className="flex items-baseline justify-between pt-1">
                                        <div className="flex items-center gap-space-xs">
                                            <span className="font-headline-md text-headline-md text-primary font-bold">33,000원</span>
                                            <span className="bg-primary text-on-primary font-label-sm text-label-sm px-1.5 py-0.5 rounded">27% 단체할인</span>
                                        </div>
                                        <span className="font-caption text-caption text-primary font-bold">[11벌 달성 시 적용 금액]</span>
                                    </div>
                                    <div className="font-caption text-caption text-secondary flex items-center justify-between pt-1">
                                        <span>* 현재 8벌 기준가: 36,000원 (20% 할인)</span>
                                        <span className="text-primary font-bold">1인당 12,000원 절감</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-space-md pb-space-sm bg-surface-container-low px-space-md py-space-xs rounded">
                                <h2 className="font-headline-sm text-headline-sm text-primary">팀원 선택 옵션 현황</h2>
                                <span className="font-caption text-caption text-secondary">실시간 통계 (8건)</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-secondary mb-space-md">
                                동료 팀원들이 현재 선택해 둔 사이즈 분포 및 마킹 리스트입니다. 중복 방지에 참고하세요.
                            </p>
                            <div className="space-y-space-sm mb-space-lg">
                                {SIZE_STATS.map((stat) => (
                                    <div key={stat.size} className="flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded">
                                        <div className="flex items-center gap-space-sm">
                                            <span
                                                className={`w-7 h-7 flex items-center justify-center font-label-sm text-label-sm rounded ${
                                                    stat.highlight ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-primary'
                                                }`}
                                            >
                                                {stat.size}
                                            </span>
                                            <span className="font-label-md text-label-md text-on-surface">{stat.label}</span>
                                        </div>
                                        <div className="flex items-center gap-space-xs">
                                            <div className="w-24 bg-surface-variant h-2 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full" style={{ width: stat.width }} />
                                            </div>
                                            <span className="font-label-md text-label-md text-primary font-bold">{stat.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <span className="font-caption text-caption text-secondary uppercase tracking-wider block mb-space-xs">현재 등록된 배번 (중복 불가)</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {REGISTERED_NUMBERS.map((number) => (
                                        <span key={number} className="bg-surface-container-high text-primary font-label-sm text-label-sm px-2 py-1 rounded">
                                            {number}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-space-md pt-space-md bg-surface-container-low p-space-sm rounded text-center font-caption text-caption text-secondary">
                            [참여자가 추가될 때마다 번호 현황표가 실시간으로 갱신됩니다]
                        </div>
                    </div>
                </div>

                <section className="bg-surface-container-lowest p-space-xl rounded shadow-md mb-space-xl text-center space-y-space-md">
                    <div className="inline-flex items-center gap-space-xs bg-surface-container-high px-space-md py-1 rounded-full">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                        <span className="font-label-sm text-label-sm text-primary font-bold">상태 A: 현재 실시간 모집 진행 중</span>
                    </div>
                    <div className="max-w-[640px] mx-auto space-y-space-xs">
                        <h2 className="font-headline-lg text-headline-lg text-primary">지금 바로 참여하여 내 옵션을 선택하세요</h2>
                        <p className="font-body-md text-body-md text-secondary">
                            호스트가 지정한 팀 유니폼 기본 템플릿에 내 사이즈(M~2XL), 등번호, 영문 이니셜만 입력하면 즉시 참여됩니다.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-space-md pt-space-sm">
                        <Link
                            className="w-full sm:w-[320px] h-[52px] bg-primary text-on-primary font-headline-sm text-headline-sm rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-space-sm shadow-md"
                            href={ROUTES.groupPurchaseOptions()}
                        >
                            <span>참여하여 내 상품/옵션 담기</span>
                            <Icon name="arrow_forward" className="text-[20px]" />
                        </Link>
                        <Link
                            className="w-full sm:w-auto h-[52px] px-space-lg bg-surface-container text-primary font-label-md text-label-md rounded hover:bg-surface-container-high transition-colors flex items-center justify-center"
                            href={ROUTES.groupPurchase()}
                        >
                            비회원으로 미리보기
                        </Link>
                    </div>
                    <div className="pt-space-xs">
                        <p className="font-caption text-caption text-secondary flex items-center justify-center gap-1">
                            <Icon name="lock_reset" className="text-[14px]" />
                            참여 후에도 수정 마감 시점(11월 8일 18:00) 전까지 언제든 본인의 사이즈와 마킹을 수정할 수 있습니다.
                        </p>
                    </div>
                </section>

                <section className="bg-surface-container-low p-space-xl rounded space-y-space-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm bg-surface-container px-space-md py-space-xs rounded">
                        <div className="flex items-center gap-space-xs">
                            <Icon name="difference" className="text-secondary text-[18px]" />
                            <h3 className="font-label-md text-label-md text-primary font-bold">[와이어프레임 보조 패널: 상태 B - 정원이 찬 경우 화면 예시]</h3>
                        </div>
                        <span className="font-caption text-caption text-secondary">VARIANT STATE SIMULATION (FULL CAPACITY)</span>
                    </div>
                    <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
                            <div className="space-y-space-xs">
                                <div className="flex items-center gap-space-xs">
                                    <span className="bg-error text-on-error font-caption text-caption px-2 py-0.5 rounded font-bold">[모집 마감 / 정원 초과]</span>
                                    <span className="font-caption text-caption text-secondary font-mono">15/15명 정원 도달</span>
                                </div>
                                <h4 className="font-headline-sm text-headline-sm text-secondary">FC 에이스 팀 공동구매 모집 인원이 모두 채워졌습니다</h4>
                                <p className="font-body-sm text-body-sm text-secondary">
                                    구매 제안자(방장)가 정원을 늘리거나 기존 참여자가 주문을 취소할 경우 실시간으로 참여가 재개됩니다.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm w-full md:w-auto">
                                <button
                                    className="h-[44px] px-space-lg bg-surface-variant text-outline font-label-md text-label-md rounded cursor-not-allowed flex items-center justify-center gap-space-xs"
                                    disabled
                                    type="button"
                                >
                                    <Icon name="block" className="text-[18px]" />
                                    <span>정원이 모두 찼습니다 (대기 등록)</span>
                                </button>
                                <button
                                    className="h-[44px] px-space-md bg-surface-container text-primary font-label-sm text-label-sm rounded hover:bg-surface-container-high transition-colors"
                                    type="button"
                                >
                                    취소 알림 받기
                                </button>
                            </div>
                        </div>
                        <div className="mt-space-md pt-space-sm bg-surface-container-low px-space-md py-space-xs rounded flex items-center justify-between font-caption text-caption text-secondary">
                            <span>* 시스템 동작 규칙: 취소 발생 시 대기 신청 순번대로 카카오 알림톡 자동 발송 처리</span>
                            <span className="text-primary font-bold">호스트 문의: 김철수 (팀장) 1:1 대화</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
