'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { getGetMyList1QueryKey, useCreate } from '@/api/generated/shared-group-purchase-controller/shared-group-purchase-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { useCurrentUser } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';

// 제한은 BE SharedGroupPurchaseCreateRequest 검증과 맞춘다.
const TITLE_MAX = 50;
const MIN_PARTICIPANTS = 2;
const MAX_PARTICIPANTS = 100;

const createSchema = z.object({
    title: z.string().trim().min(1, '공동구매 제목을 입력해주세요.').max(TITLE_MAX, `${TITLE_MAX}자 이하로 입력해주세요.`),
    maxParticipants: z
        .number({ error: '최대 인원을 입력해주세요.' })
        .int('정수로 입력해주세요.')
        .min(MIN_PARTICIPANTS, `${MIN_PARTICIPANTS}명 이상으로 입력해주세요.`)
        .max(MAX_PARTICIPANTS, `${MAX_PARTICIPANTS}명 이하로 입력해주세요.`),
    agreed: z.boolean().refine((checked) => checked, '진행 규칙을 확인하고 동의해주세요.'),
});

type CreateValues = z.infer<typeof createSchema>;

// 수정 기한(48시간)·마감 보류(24시간)는 BE가 정한다. (SharedGroupPurchase.EDIT_PERIOD, FROZEN_PERIOD)
const POLICIES = [
    '만든 뒤 48시간 동안 참여자 모두가 상품을 담고 수량·옵션을 바꿀 수 있습니다.',
    '48시간이 지나면 자동으로 마감되며, 담긴 상품이 없으면 공동구매는 취소됩니다.',
    '구매할 수 없는 상품이 있으면 24시간 동안 마감이 보류되고, 그 뒤 해당 상품을 빼고 마감됩니다.',
    '만든 사람은 기한 전에 직접 마감하거나 취소할 수 있습니다.',
];

const INPUT_CLASS =
    'w-full h-11 px-space-md border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface rounded focus:border-primary outline-none placeholder:text-outline';

// 공동물품(N빵) 공동구매를 만든다. 만들면 완료 화면(?id=)에서 초대 링크를 보여 준다.
export default function CreateGroupPurchaseForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useCurrentUser();
    const createPurchase = useCreate({
        mutation: {
            onSuccess: (res) => {
                void queryClient.invalidateQueries({ queryKey: getGetMyList1QueryKey() });
                const id = res.data?.id;
                // 응답에 id 가 없으면 완료 화면을 열 수 없으니 목록으로 보낸다. (만들어진 공동구매는 목록에 보인다)
                router.push(id !== undefined ? `${ROUTES.groupPurchaseCreated}?id=${id}` : ROUTES.groupPurchases);
            },
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<CreateValues>({
        resolver: zodResolver(createSchema),
        defaultValues: { title: '', maxParticipants: 10, agreed: false },
    });
    const title = useWatch({ control, name: 'title' });
    const maxParticipants = useWatch({ control, name: 'maxParticipants' });

    const step = (delta: number) => {
        const current = Number.isNaN(maxParticipants) ? MIN_PARTICIPANTS : maxParticipants;
        setValue('maxParticipants', Math.min(MAX_PARTICIPANTS, Math.max(MIN_PARTICIPANTS, current + delta)), { shouldValidate: true });
    };

    const onSubmit = (values: CreateValues) => {
        // 검증이 비동기라 버튼이 비활성되기 전에 두 번 제출될 수 있어 한 번 더 막는다.
        if (createPurchase.isPending || createPurchase.isSuccess) return;
        createPurchase.mutate({ data: { title: values.title, maxParticipants: values.maxParticipants } });
    };

    const busy = createPurchase.isPending || createPurchase.isSuccess;

    return (
        <form className="grid grid-cols-12 gap-gutter items-start" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-space-lg">
                <div className="p-space-lg rounded bg-surface-container-lowest shadow-sm flex flex-col gap-space-lg">
                    {/* 1. 제목 */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-primary flex items-center justify-between" htmlFor="group-title">
                            <span className="flex items-center gap-1">
                                1. 공동구매 제목
                                <span className="text-error font-bold">*</span>
                            </span>
                            <span className="font-caption text-caption text-secondary">
                                {title.length} / {TITLE_MAX}자
                            </span>
                        </label>
                        <input
                            className={INPUT_CLASS}
                            id="group-title"
                            maxLength={TITLE_MAX}
                            placeholder="예: FC 에이스 하반기 유니폼 공동구매"
                            type="text"
                            {...register('title')}
                        />
                        {errors.title ? (
                            <p className="font-caption text-caption text-error">{errors.title.message}</p>
                        ) : (
                            <p className="font-caption text-caption text-secondary">초대 링크를 받은 팀원에게 보이는 이름입니다.</p>
                        )}
                    </div>
                    <div className="h-[1px] bg-surface-variant w-full" />

                    {/* 2. 최대 인원 */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-primary flex items-center justify-between" htmlFor="max-participants">
                            <span className="flex items-center gap-1">
                                2. 최대 참여 인원
                                <span className="text-error font-bold">*</span>
                            </span>
                            <span className="font-caption text-caption text-secondary">
                                {MIN_PARTICIPANTS} ~ {MAX_PARTICIPANTS}명 (나 포함)
                            </span>
                        </label>
                        <div className="flex items-center gap-2 max-w-[280px]">
                            <div className="flex-1 flex items-center border border-outline-variant bg-surface-container-lowest rounded px-space-md h-11">
                                <input
                                    className="w-full bg-transparent font-headline-sm text-headline-sm text-primary focus:outline-none"
                                    id="max-participants"
                                    inputMode="numeric"
                                    max={MAX_PARTICIPANTS}
                                    min={MIN_PARTICIPANTS}
                                    type="number"
                                    {...register('maxParticipants', { valueAsNumber: true })}
                                />
                                <span className="font-body-md text-body-md text-secondary ml-1">명</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <button
                                    className="w-8 h-5 flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest text-primary rounded"
                                    type="button"
                                    aria-label="인원 늘리기"
                                    onClick={() => step(1)}
                                >
                                    <Icon name="expand_less" className="text-[14px]" />
                                </button>
                                <button
                                    className="w-8 h-5 flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest text-primary rounded"
                                    type="button"
                                    aria-label="인원 줄이기"
                                    onClick={() => step(-1)}
                                >
                                    <Icon name="expand_more" className="text-[14px]" />
                                </button>
                            </div>
                        </div>
                        {errors.maxParticipants ? (
                            <p className="font-caption text-caption text-error">{errors.maxParticipants.message}</p>
                        ) : (
                            <p className="font-caption text-caption text-secondary">정원이 차면 더 참여할 수 없습니다. 만든 뒤에는 늘리는 것만 가능합니다.</p>
                        )}
                    </div>
                    <div className="h-[1px] bg-surface-variant w-full" />

                    {/* 3. 일정: BE가 정하는 고정 기한이라 입력받지 않는다 */}
                    <div className="flex flex-col gap-1.5">
                        <span className="font-label-md text-label-md text-primary">3. 진행 일정</span>
                        <div className="flex items-center gap-2 p-space-md rounded bg-surface-container-low text-on-surface">
                            <Icon name="schedule" className="text-[18px] text-primary" />
                            <span className="font-body-sm text-body-sm">
                                상품 담기·수정은 <strong>만든 시점부터 48시간</strong> 동안 가능하며, 기한이 지나면 자동으로 마감됩니다.
                            </span>
                        </div>
                        <p className="font-caption text-caption text-secondary">마감 일시 직접 설정은 준비 중입니다.</p>
                    </div>
                    <div className="h-[1px] bg-surface-variant w-full" />

                    {/* 4. 공지: BE에 저장할 곳이 없어 비활성 */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-primary flex items-center gap-1" htmlFor="announcement-text">
                            4. 팀원 안내 문구
                            <span className="font-caption text-caption text-secondary font-normal">(준비 중)</span>
                        </label>
                        <textarea
                            className="w-full p-space-md border border-outline-variant bg-surface-container-lowest font-body-md text-body-md rounded resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                            id="announcement-text"
                            disabled
                            placeholder="팀원에게 전달할 안내 사항 (준비 중)"
                            rows={3}
                        />
                    </div>
                    <div className="h-[1px] bg-surface-variant w-full" />

                    {/* 5. 진행 규칙 동의 */}
                    <div className="flex flex-col gap-2 p-space-md rounded bg-surface">
                        <label className="flex items-start gap-space-sm cursor-pointer select-none">
                            <input className="w-4 h-4 mt-0.5 accent-primary cursor-pointer" type="checkbox" {...register('agreed')} />
                            <span className="font-label-sm text-label-sm text-primary leading-tight">[필수] 공동구매 진행 규칙 확인 및 동의</span>
                        </label>
                        <ul className="pl-6 text-secondary font-caption text-caption space-y-1">
                            {POLICIES.map((policy) => (
                                <li key={policy}>· {policy}</li>
                            ))}
                        </ul>
                        {errors.agreed && <p className="pl-6 font-caption text-caption text-error">{errors.agreed.message}</p>}
                    </div>
                </div>
            </div>

            {/* 우측 요약 · 제출 */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-32">
                <div className="p-space-lg rounded bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                    <h3 className="font-headline-sm text-headline-sm text-primary">만들기 요약</h3>
                    <div className="space-y-space-sm font-body-sm text-body-sm">
                        <SummaryRow label="만드는 사람" value={user?.nickname ?? '-'} />
                        <SummaryRow label="제목" value={title.trim() || '-'} />
                        <SummaryRow label="최대 인원" value={Number.isNaN(maxParticipants) ? '-' : `${maxParticipants}명`} />
                        <SummaryRow label="수정 마감" value="만든 뒤 48시간" />
                        <SummaryRow label="결제 방식" value="참여 인원 수로 나눠 결제" />
                    </div>
                    <div className="flex gap-2 p-3 rounded bg-surface text-secondary font-caption text-caption">
                        <Icon name="share" className="text-[16px] text-primary mt-0.5" />
                        <p className="leading-normal">
                            만들면 바로 <strong>팀 초대 링크</strong>가 생성되어 팀원들에게 공유할 수 있습니다.
                        </p>
                    </div>
                </div>
                <div className="p-space-lg rounded bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
                    {createPurchase.isError && (
                        <p className="font-body-sm text-body-sm text-error" role="alert">
                            {errorMessage(createPurchase.error, '공동구매를 만들지 못했습니다.')}
                        </p>
                    )}
                    <button
                        className="w-full h-11 bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm disabled:opacity-60"
                        type="submit"
                        disabled={busy}
                    >
                        <Icon name="group_add" className="text-[18px]" />
                        <span>{busy ? '만드는 중...' : '공동구매 만들기'}</span>
                    </button>
                    <Link
                        className="w-full h-11 bg-surface-container-lowest text-primary font-label-md text-label-md rounded flex items-center justify-center gap-1 hover:bg-surface-container transition-all"
                        href={ROUTES.groupPurchases}
                    >
                        취소하고 돌아가기
                    </Link>
                </div>
            </div>
        </form>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-space-sm py-1">
            <span className="text-secondary shrink-0">{label}</span>
            <span className="text-primary font-medium text-right break-all">{value}</span>
        </div>
    );
}
