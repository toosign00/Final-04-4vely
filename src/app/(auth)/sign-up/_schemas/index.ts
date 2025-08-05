import { z } from 'zod';

// 검증 스키마들
export const step1Schema = z.object({
  agreeTerms: z.boolean().refine((val) => val === true, '이용약관에 동의해주세요.'),
  agreePrivacy: z.boolean().refine((val) => val === true, '개인정보처리방침에 동의해주세요.'),
});

export const step2Schema = z
  .object({
    name: z.string().min(2, '이름은 2자 이상이어야 합니다.').max(50, '이름은 50자 이하여야 합니다.'),
    email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.'),
    confirmPassword: z.string(),
    phone: z.string().regex(/^010\d{8}$/, '휴대폰 번호는 01012345678 형식으로 입력해주세요.'),
    postalCode: z.string().min(1, '우편번호를 선택해주세요.'),
    address: z.string().min(1, '주소를 선택해주세요.'),
    addressDetail: z
      .string()
      .min(1, '상세주소를 입력해주세요.')
      .refine((val) => val.trim().length >= 5, '상세주소는 5자 이상 입력해주세요.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

export const step3Schema = z.object({
  image: z.any().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  birthDate: z.string().optional(),
});
