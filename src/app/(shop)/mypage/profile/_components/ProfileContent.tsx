'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { apiFetch, ApiError } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import WithdrawalButton from './WithdrawalButton';

type Profile = {
    email: string;
    nickname: string;
    phone: string;
    birthDate: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
    updatedAt: string | null;
    defaultAddress: { zipCode: string; basicAddress: string; detailAddress: string | null } | null;
};

type DashboardSummary = {
    wallet: { balance: number; heldBalance: number };
    groupPurchases: unknown[];
};

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

// 서버 MemberPolicy 와 같은 규칙
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/;
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;
const PHONE_REGEX = /^010-\d{4}-\d{4}$/;

const INPUT_CLASS =
    'h-[42px] px-space-md border border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm rounded focus:border-primary outline-none';
const DISABLED_INPUT_CLASS =
    'h-[42px] px-space-md border border-outline-variant bg-surface-container text-outline font-body-sm rounded cursor-not-allowed';
const LABEL_CLASS = 'font-body-sm text-body-sm text-on-surface font-medium mb-1';
const SUB_BUTTON_CLASS =
    'h-[42px] px-space-md border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm whitespace-nowrap rounded disabled:opacity-60 disabled:cursor-default';
const CAPTION = 'font-caption text-caption';

function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatDateTime(iso: string | null) {
    if (!iso) return '-';
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const errorMessage = (e: unknown, fallback: string) => (e instanceof ApiError ? e.message : fallback);

export default function ProfileContent() {
    const router = useRouter();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);

    // 수정 입력값
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');
    const [nicknameCheck, setNicknameCheck] = useState<CheckState>('idle');

    // 휴대폰 변경 인증
    const [codeSent, setCodeSent] = useState(false);
    const [code, setCode] = useState('');
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [phoneBusy, setPhoneBusy] = useState(false);

    // 비밀번호
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const applyProfile = useCallback((p: Profile) => {
        setProfile(p);
        setNickname(p.nickname);
        setPhone(p.phone);
        setNicknameCheck('idle');
        setCodeSent(false);
        setCode('');
        setPhoneVerified(false);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch<Profile>('/api/members/me/profile');
                if (res.data) applyProfile(res.data);
            } catch (e) {
                if (e instanceof ApiError && e.resultCode.startsWith('401')) {
                    router.replace(ROUTES.login);
                    return;
                }
                alert(errorMessage(e, '회원정보를 불러오지 못했습니다.'));
                return;
            }

            // 탈퇴 안내용 요약 (실패해도 화면은 계속 보여줌)
            try {
                const res = await apiFetch<DashboardSummary>('/api/members/me/dashboard');
                setSummary(res.data);
            } catch {
                setSummary(null);
            }
        })();
    }, [applyProfile, router]);

    if (!profile) {
        return (
            <div className="col-span-9 flex flex-col gap-space-xl">
                <div className="h-[520px] rounded bg-surface-container animate-pulse" />
            </div>
        );
    }

    const nicknameChanged = nickname.trim() !== profile.nickname;
    const phoneChanged = phone.trim() !== profile.phone;
    const passwordTouched = Boolean(currentPassword || newPassword || newPasswordConfirm);

    const handleCheckNickname = async () => {
        const value = nickname.trim();
        if (!NICKNAME_REGEX.test(value)) {
            setNicknameCheck('invalid');
            return;
        }
        setNicknameCheck('checking');
        try {
            const res = await apiFetch<{ available: boolean }>(`/api/auth/check-nickname?nickname=${encodeURIComponent(value)}`);
            setNicknameCheck(res.data?.available ? 'available' : 'taken');
        } catch (e) {
            setNicknameCheck('idle');
            alert(errorMessage(e, '닉네임 확인 중 오류가 발생했습니다.'));
        }
    };

    const handleSendCode = async () => {
        if (!PHONE_REGEX.test(phone)) {
            alert('휴대폰 번호를 010-0000-0000 형식으로 입력해주세요.');
            return;
        }
        setPhoneBusy(true);
        try {
            await apiFetch('/api/auth/phone/send', { method: 'POST', body: JSON.stringify({ phone }) });
            setCodeSent(true);
            setPhoneVerified(false);
            setCode('');
            alert('인증번호가 발송되었습니다.');
        } catch (e) {
            alert(errorMessage(e, '인증번호 발송에 실패했습니다.'));
        } finally {
            setPhoneBusy(false);
        }
    };

    const handleVerifyCode = async () => {
        setPhoneBusy(true);
        try {
            await apiFetch('/api/auth/phone/verify', { method: 'POST', body: JSON.stringify({ phone, code }) });
            setPhoneVerified(true);
        } catch (e) {
            alert(errorMessage(e, '인증에 실패했습니다.'));
        } finally {
            setPhoneBusy(false);
        }
    };

    const handleReset = () => {
        applyProfile(profile);
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
        setFormError(null);
    };

    const handleSave = async () => {
        setFormError(null);

        if (!nicknameChanged && !phoneChanged && !passwordTouched) {
            setFormError('변경된 내용이 없습니다.');
            return;
        }
        if (nicknameChanged && nicknameCheck !== 'available') {
            setFormError('닉네임 중복확인을 해주세요.');
            return;
        }
        if (phoneChanged && !phoneVerified) {
            setFormError('변경할 휴대폰 번호의 인증을 완료해주세요.');
            return;
        }
        if (passwordTouched) {
            if (!currentPassword) {
                setFormError('현재 비밀번호를 입력해주세요.');
                return;
            }
            if (!PASSWORD_REGEX.test(newPassword)) {
                setFormError('새 비밀번호는 8~20자, 영문·숫자·특수문자를 모두 포함해야 합니다.');
                return;
            }
            if (newPassword !== newPasswordConfirm) {
                setFormError('새 비밀번호가 일치하지 않습니다.');
                return;
            }
        }

        setSaving(true);
        try {
            if (nicknameChanged || phoneChanged) {
                const res = await apiFetch<Profile>('/api/members/me', {
                    method: 'PATCH',
                    body: JSON.stringify({ nickname: nickname.trim(), phone: phone.trim() }),
                });
                if (res.data) applyProfile(res.data);
            }
            if (passwordTouched) {
                await apiFetch('/api/members/me/password', {
                    method: 'PATCH',
                    body: JSON.stringify({ currentPassword, newPassword }),
                });
                setCurrentPassword('');
                setNewPassword('');
                setNewPasswordConfirm('');
            }
            alert('변경사항이 저장되었습니다.');
            router.refresh();
        } catch (e) {
            setFormError(errorMessage(e, '저장 중 오류가 발생했습니다.'));
        } finally {
            setSaving(false);
        }
    };

    const nicknameStatus = {
        idle: nicknameChanged ? { text: '변경하려면 중복확인이 필요합니다', className: `${CAPTION} text-outline` } : null,
        checking: { text: '확인 중...', className: `${CAPTION} text-outline` },
        available: { text: '사용 가능한 닉네임입니다', className: `${CAPTION} text-on-surface font-semibold` },
        taken: { text: '이미 사용 중인 닉네임입니다', className: `${CAPTION} text-error` },
        invalid: { text: '닉네임은 2~10자의 한글, 영문, 숫자만 가능합니다', className: `${CAPTION} text-error` },
    }[nicknameCheck];

    const isSeller = profile.role === 'SELLER';
    const groupCount = summary?.groupPurchases.length ?? 0;
    const balance = summary?.wallet.balance ?? 0;

    return (
        <div className="col-span-9 flex flex-col gap-space-xl">
            {/* 회원정보 수정 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-xl">
                <div className="flex items-center justify-between pb-space-md border-b border-surface-container mb-space-xl">
                    <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface font-bold">회원정보 수정</h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                            계정 정보, 비밀번호 및 연락처 정보를 안전하게 관리하세요.
                        </p>
                    </div>
                    <span className="font-caption text-caption px-space-sm py-1 bg-surface-container border border-outline-variant text-on-surface-variant">
                        최근 수정: {formatDateTime(profile.updatedAt)}
                    </span>
                </div>

                <form className="flex flex-col gap-space-lg" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-gutter">
                        <div className="flex flex-col">
                            <label className={LABEL_CLASS} htmlFor="profile-email">
                                아이디 (이메일)
                            </label>
                            <input className={DISABLED_INPUT_CLASS} disabled id="profile-email" type="text" value={profile.email} />
                            <span className={`${CAPTION} text-outline mt-1`}>아이디는 변경할 수 없습니다.</span>
                        </div>
                        <div className="flex flex-col">
                            <label className={LABEL_CLASS} htmlFor="profile-birth">
                                생년월일
                            </label>
                            <input className={DISABLED_INPUT_CLASS} disabled id="profile-birth" type="text" value={profile.birthDate} />
                            <span className={`${CAPTION} text-outline mt-1`}>생년월일은 변경할 수 없습니다.</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-gutter">
                        {/* 닉네임 */}
                        <div className="flex flex-col">
                            <label className={LABEL_CLASS} htmlFor="profile-nickname">
                                닉네임 (팀 내 표시 이름)
                            </label>
                            <div className="flex gap-space-xs">
                                <input
                                    className={`w-full ${INPUT_CLASS}`}
                                    id="profile-nickname"
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => {
                                        setNickname(e.target.value);
                                        setNicknameCheck('idle');
                                    }}
                                />
                                <button
                                    className={SUB_BUTTON_CLASS}
                                    type="button"
                                    onClick={handleCheckNickname}
                                    disabled={!nicknameChanged || nicknameCheck === 'checking' || nicknameCheck === 'available'}
                                >
                                    {nicknameCheck === 'available' ? '확인완료' : '중복확인'}
                                </button>
                            </div>
                            {nicknameStatus && <span className={`${nicknameStatus.className} mt-1`}>{nicknameStatus.text}</span>}
                        </div>

                        {/* 휴대폰 */}
                        <div className="flex flex-col">
                            <label className={LABEL_CLASS} htmlFor="profile-phone">
                                휴대폰 번호
                            </label>
                            <div className="flex gap-space-xs">
                                <input
                                    className={`w-full ${INPUT_CLASS}`}
                                    id="profile-phone"
                                    type="tel"
                                    inputMode="numeric"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(formatPhone(e.target.value));
                                        setCodeSent(false);
                                        setPhoneVerified(false);
                                        setCode('');
                                    }}
                                />
                                <button
                                    className={SUB_BUTTON_CLASS}
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={!phoneChanged || phoneVerified || phoneBusy}
                                >
                                    {phoneVerified ? '인증완료' : codeSent ? '재발송' : '인증'}
                                </button>
                            </div>
                            {phoneChanged && codeSent && !phoneVerified && (
                                <div className="flex gap-space-xs mt-space-xs">
                                    <input
                                        className={`w-full ${INPUT_CLASS}`}
                                        placeholder="인증번호 6자리"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                    <button
                                        className={SUB_BUTTON_CLASS}
                                        type="button"
                                        onClick={handleVerifyCode}
                                        disabled={code.length !== 6 || phoneBusy}
                                    >
                                        확인
                                    </button>
                                </div>
                            )}
                            {phoneChanged && !codeSent && (
                                <span className={`${CAPTION} text-outline mt-1`}>번호를 바꾸려면 인증이 필요합니다.</span>
                            )}
                            {phoneVerified && <span className={`${CAPTION} text-on-surface font-semibold mt-1`}>휴대폰 인증이 완료되었습니다.</span>}
                        </div>
                    </div>

                    {/* 비밀번호 변경 */}
                    <div className="pt-space-md border-t border-surface-container">
                        <div className="font-headline-sm text-headline-sm text-on-surface font-bold mb-1">비밀번호 변경</div>
                        <p className={`${CAPTION} text-outline mb-space-md`}>변경하지 않으려면 비워 두세요.</p>
                        <div className="grid grid-cols-3 gap-gutter">
                            <div className="flex flex-col">
                                <label className={LABEL_CLASS} htmlFor="current-password">
                                    현재 비밀번호
                                </label>
                                <input
                                    className={INPUT_CLASS}
                                    id="current-password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className={LABEL_CLASS} htmlFor="new-password">
                                    새 비밀번호
                                </label>
                                <input
                                    className={INPUT_CLASS}
                                    id="new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="영문·숫자·특수문자 포함 8~20자"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className={LABEL_CLASS} htmlFor="new-password-confirm">
                                    새 비밀번호 확인
                                </label>
                                <input
                                    className={INPUT_CLASS}
                                    id="new-password-confirm"
                                    type="password"
                                    autoComplete="new-password"
                                    value={newPasswordConfirm}
                                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                />
                                {newPasswordConfirm && (
                                    <span
                                        className={`${CAPTION} mt-1 ${
                                            newPassword === newPasswordConfirm ? 'text-on-surface font-semibold' : 'text-error'
                                        }`}
                                    >
                                        {newPassword === newPasswordConfirm ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 기본 배송지 */}
                    <div className="pt-space-md border-t border-surface-container">
                        <div className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">배송지 관리</div>
                        <div className="flex items-center justify-between p-space-md border border-outline-variant bg-surface-container-low rounded">
                            {profile.defaultAddress ? (
                                <div>
                                    <div className="flex items-center gap-space-xs mb-1">
                                        <span className="font-label-sm text-label-sm text-on-surface font-bold">기본 배송지</span>
                                        <span className="px-1 bg-primary text-on-primary font-caption text-caption">DEFAULT</span>
                                    </div>
                                    <div className="font-body-sm text-body-sm text-on-surface-variant">
                                        [{profile.defaultAddress.zipCode}] {profile.defaultAddress.basicAddress}
                                        {profile.defaultAddress.detailAddress ? `, ${profile.defaultAddress.detailAddress}` : ''}
                                    </div>
                                </div>
                            ) : (
                                <div className="font-body-sm text-body-sm text-outline">등록된 기본 배송지가 없습니다.</div>
                            )}
                            <Link
                                className="px-space-md py-1.5 border border-outline-variant bg-surface hover:bg-surface-container font-label-sm text-label-sm text-on-surface rounded"
                                href={ROUTES.addresses}
                            >
                                {profile.defaultAddress ? '수정' : '등록'}
                            </Link>
                        </div>
                    </div>

                    {formError && <p className={`${CAPTION} text-error text-right`}>{formError}</p>}

                    <div className="flex justify-end gap-space-sm pt-space-md">
                        <button
                            className="h-[44px] px-space-xl border border-outline-variant bg-surface hover:bg-surface-container text-on-surface font-label-md rounded transition-colors"
                            type="button"
                            onClick={handleReset}
                        >
                            취소
                        </button>
                        <button
                            className="h-[44px] px-space-xl bg-primary hover:bg-primary/90 text-on-primary font-label-md rounded transition-colors disabled:opacity-60"
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? '저장 중...' : '변경사항 저장'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 판매자 등록 및 관리 */}
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
                        <span className={`${CAPTION} text-outline`}>회원 권한 상태:</span>
                        <span
                            className={`font-label-sm text-label-sm px-space-sm py-0.5 border rounded font-medium ${
                                isSeller ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container border-outline-variant text-on-surface'
                            }`}
                        >
                            {isSeller ? '판매자 (활성)' : profile.role === 'ADMIN' ? '관리자' : '일반 회원 (판매자 미등록)'}
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
                                판매자 정보를 등록하면 상품을 직접 올리고 공동구매 주문을 받을 수 있습니다. 만 19세 이상만 가능합니다.
                            </p>
                        </div>
                        <div className="flex items-center justify-end pt-space-xs border-t border-surface-container">
                            {isSeller ? (
                                <span className={`${CAPTION} text-outline`}>이미 판매자로 등록되어 있습니다.</span>
                            ) : (
                                <Link
                                    className="h-[38px] px-space-md bg-primary hover:bg-primary/90 text-on-primary font-label-sm rounded inline-flex items-center gap-space-xs transition-colors"
                                    href={ROUTES.sellerApply}
                                >
                                    <Icon name="app_registration" className="text-[16px]" />
                                    판매자 등록 신청
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="p-space-md border border-outline-variant bg-surface-container-low rounded flex flex-col justify-between gap-space-md">
                        <div>
                            <div className="flex items-center gap-space-xs mb-space-xs">
                                <Icon name="admin_panel_settings" className="text-[18px] text-outline" />
                                <span className="font-label-md text-label-md text-on-surface font-bold">판매자 센터 (파트너 콘솔)</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                                주문 접수, 송장 등록 및 정산 관리를 할 수 있습니다.
                            </p>
                        </div>
                        <div className="flex items-center justify-end pt-space-xs border-t border-surface-container">
                            {isSeller ? (
                                <Link
                                    className="h-[38px] px-space-md border border-outline-variant bg-surface hover:bg-surface-container text-on-surface font-label-sm rounded inline-flex items-center gap-space-xs transition-colors"
                                    href={ROUTES.seller}
                                >
                                    <Icon name="open_in_new" className="text-[16px]" />
                                    판매자 센터 바로가기
                                </Link>
                            ) : (
                                <span className={`${CAPTION} text-outline`}>판매자 등록 후 이용 가능</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 회원 탈퇴 */}
            <div className="bg-surface-container-lowest border border-error/50 rounded p-space-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-error" />
                <div className="flex items-start justify-between pb-space-md border-b border-surface-container mb-space-md">
                    <div>
                        <h3 className="font-headline-md text-headline-md text-error font-bold flex items-center gap-space-xs">
                            <Icon name="warning" />
                            회원 탈퇴
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                            탈퇴하면 계정을 다시 사용할 수 없으며, 진행 중인 공동구매와 예치금이 없어야 탈퇴할 수 있습니다.
                        </p>
                    </div>
                </div>

                {(groupCount > 0 || balance > 0) && (
                    <div className="bg-error-container/20 border border-error/30 rounded p-space-md mb-space-lg flex items-start gap-space-md">
                        <Icon name="block" className="text-error text-[24px]" />
                        <div className="flex flex-col gap-space-xs">
                            <span className="font-label-sm text-label-sm text-error font-bold">
                                [회원 탈퇴 제한 안내] 진행 중인 공동구매 또는 남은 예치금이 있습니다.
                            </span>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                                현재 <strong className="text-on-surface font-semibold">{groupCount}건의 공동구매</strong>에 참여 중이며,{' '}
                                <strong className="text-on-surface font-semibold">₩{balance.toLocaleString('ko-KR')}의 예치금</strong>이
                                남아있습니다. 공동구매 종료 후 예치금을 환불받은 뒤 탈퇴할 수 있습니다.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-space-xs ${CAPTION} text-outline`}>
                        <Icon name="info" className="text-[16px]" />
                        <span>탈퇴 관련 약관 및 환불 규정은 고객센터 FAQ를 참고해주세요.</span>
                    </div>
                    <WithdrawalButton groupCount={groupCount} balance={balance} />
                </div>
            </div>
        </div>
    );
}