import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Next.js 핵심 웹 바이탈, TypeScript, Prettier 설정 확장
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),

  // 메인 린팅 규칙 설정
  {
    rules: {
      // === JavaScript 기본 규칙 ===
      "no-var": "error", // var 사용 금지 (let, const 사용 권장)
      "prefer-const": "warn", // 재할당되지 않는 변수는 const로 선언
      "no-empty": "error", // 빈 블록문 금지 (if, for, while 등)
      "no-redeclare": "error", // 변수 중복 선언 금지
      "no-param-reassign": "error", // 함수 매개변수 재할당 금지
      "prefer-template": "warn", // 문자열 연결 시 템플릿 리터럴 사용 권장

      // === TypeScript 관련 규칙 ===
      "@typescript-eslint/no-explicit-any": "warn", // any 타입 사용 금지
      "@typescript-eslint/no-floating-promises": "error", // Promise 처리 누락 방지

      // === React 관련 규칙 ===
      "react/jsx-key": "error", // 배열 렌더링 시 key prop 필수
      "react/jsx-no-target-blank": "error", // target="_blank" 사용 시 보안 이슈 방지
      "react/button-has-type": "error", // button 요소에 type 속성 필수
      "react/self-closing-comp": "error", // 자식이 없는 컴포넌트는 self-closing 태그 사용

      // === Next.js 관련 규칙 ===
      "@next/next/no-img-element": "error", // HTML img 대신 next/image 사용 강제
      "@next/next/no-html-link-for-pages": "error", // 페이지 링크는 next/link 사용
      "@next/next/no-sync-scripts": "error", // 동기 스크립트 사용 금지
      "@next/next/no-css-tags": "warn", // CSS 파일은 next/head가 아닌 import로
      "@next/next/no-head-element": "warn", // HTML head 대신 next/head 사용

      // === 접근성(a11y) 관련 규칙 ===
      "jsx-a11y/alt-text": "warn", // 이미지 요소에 alt 속성 필수
      "jsx-a11y/no-autofocus": "warn", // autofocus 사용 시 경고 (접근성 문제)
      "jsx-a11y/anchor-is-valid": "error", // a 태그 href 속성 유효성 검사
    },
  },
  {
    ignores: ["node_modules", "dist", "build", "public", "public/**"],
  },
  // 설정 파일들에 대한 예외 규칙
  {
    files: ["*.config.js", "*.config.ts", "vite.config.*", "next.config.*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // 설정 파일에서는 any 타입 허용
    },
  },

  // 테스트 파일들에 대한 예외 규칙
  {
    files: ["**/*.test.*", "**/*.spec.*", "src/test/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // 테스트에서는 any 타입 허용
      "no-param-reassign": "off", // 테스트에서는 매개변수 재할당 허용
    },
  },

  // 타입 정의 파일들에 대한 예외 규칙
  {
    files: ["**/*.d.ts", "src/vite-env.d.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // 타입 정의 파일에서는 미사용 변수 허용
    },
  },
];

export default eslintConfig;
