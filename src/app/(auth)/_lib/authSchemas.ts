import { z } from 'zod';

// 형식 규칙은 BE SignupRequest 검증과 맞춘다.
// 중복확인·인증 버튼에서 필드 하나만 검사할 수 있도록 필드별 스키마를 따로 둔다.
export const signupFields = {
    email: z.string().trim().min(1, '이메일을 입력해주세요.').max(100, '이메일은 100자 이하로 입력해주세요.').pipe(z.email('올바른 이메일 형식이 아닙니다.')),
    password: z
        .string()
        .min(1, '비밀번호를 입력해주세요.')
        .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/, '영문, 숫자, 특수문자를 포함해 8~20자로 입력해주세요.'),
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
    nickname: z
        .string()
        .trim()
        .min(1, '닉네임을 입력해주세요.')
        .regex(/^[가-힣a-zA-Z0-9]{2,10}$/, '한글, 영문, 숫자 2~10자로 입력해주세요.'),
    phone: z
        .string()
        .min(1, '휴대폰 번호를 입력해주세요.')
        .regex(/^010-\d{4}-\d{4}$/, '010-0000-0000 형식으로 입력해주세요.'),
    code: z.string(),
    // YYYYMMDD 로 입력받아 BE 형식(YYYY-MM-DD)으로 바꿔 보낸다.
    birth: z
        .string()
        .min(1, '생년월일을 입력해주세요.')
        .refine(isPastDate, '올바른 생년월일 8자리를 입력해주세요.')
        .transform((v) => `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`),
    terms: z.array(z.boolean()).refine((all) => all.every(Boolean), '필수 약관에 모두 동의해주세요.'),
    // 중복확인·인증을 통과한 값. 입력값과 다르면 다시 확인해야 한다.
    verifiedEmail: z.string(),
    verifiedNickname: z.string(),
    verifiedPhone: z.string(),
};

// 다른 필드에 형식 오류가 있어도 아래 확인 규칙은 항상 검사한다.
const always = { when: () => true };

export const signupSchema = z
    .object(signupFields)
    .refine((v) => v.password === v.passwordConfirm, {
        path: ['passwordConfirm'],
        message: '비밀번호가 일치하지 않습니다.',
        ...always,
    })
    .refine((v) => v.verifiedEmail === v.email, { path: ['email'], message: '이메일 중복확인을 해주세요.', ...always })
    .refine((v) => v.verifiedNickname === v.nickname, { path: ['nickname'], message: '닉네임 중복확인을 해주세요.', ...always })
    .refine((v) => v.verifiedPhone === v.phone, { path: ['phone'], message: '휴대폰 인증을 완료해주세요.', ...always });

export type SignupInput = z.input<typeof signupSchema>;
export type SignupOutput = z.output<typeof signupSchema>;

export const loginSchema = z.object({
    email: z.string().trim().min(1, '이메일 주소를 입력해주세요.'),
    password: z.string().min(1, '비밀번호를 입력해주세요.'),
    remember: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

// 실제로 존재하는 과거 날짜인지 (YYYYMMDD). BE @Past 와 같이 오늘은 허용하지 않는다.
function isPastDate(raw: string): boolean {
    if (!/^\d{8}$/.test(raw)) return false;
    const [y, m, d] = [raw.slice(0, 4), raw.slice(4, 6), raw.slice(6, 8)].map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const isRealDate = date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
    const now = new Date();
    const today = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    return isRealDate && raw < today;
}
