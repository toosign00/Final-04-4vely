const prettierConfig = {
  // 문장 끝에 세미콜론 추가
  semi: true,
  // 다중 요소에서 마지막 요소 뒤에 쉼표 추가
  trailingComma: 'all',
  // 문자열에 작은따옴표 사용
  singleQuote: true,
  // 한 줄 최대 길이 (100자)
  printWidth: 100,
  // 탭 크기 (스페이스 2개)
  tabWidth: 2,
  // 탭 대신 스페이스 사용
  useTabs: false,
  // 줄바꿈 문자 형식 (Unix 스타일)
  endOfLine: 'lf',
  // 객체 리터럴 중괄호 내부에 공백 추가
  bracketSpacing: true,
  // JSX에서 마지막 `>`를 다음 줄로 이동
  bracketSameLine: false,
  // 화살표 함수 매개변수에 항상 괄호 추가
  arrowParens: 'always',
  // JSX에서 문자열에 작은따옴표 사용
  jsxSingleQuote: true,
  // 객체 속성에 따옴표를 필요한 경우에만 추가
  quoteProps: 'as-needed',
  // 마크다운 텍스트 줄바꿈 방식 유지
  proseWrap: 'preserve',
  // HTML 공백 민감도 (CSS 규칙 따름)
  htmlWhitespaceSensitivity: 'css',
  // 내장된 언어 코드 자동 포매팅
  embeddedLanguageFormatting: 'auto',
};

export default prettierConfig;
