# AI Tree Portal

Next.js 기반의 마크다운 문서 관리 포털입니다.

## 주요 기능

- ✍️ 마크다운 기반 문서 작성
- 🏷️ 태그 및 카테고리 관리
- 🔍 전체 텍스트 검색
- 📊 JSON-LD 구조화 데이터 지원
- 📝 Git 기반 버전 관리
  - 변경 이력 추적
  - 문서 버전 비교
  - 롤백 기능

## 기술 스택

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **데이터 저장**: 마크다운 파일, Git
- **검색**: 전체 텍스트 검색, 태그/카테고리 필터링
- **SEO**: JSON-LD, 동적 메타데이터

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 프로젝트 구조

```
src/
├── app/              # Next.js 페이지 및 레이아웃
├── components/       # React 컴포넌트
├── lib/             # 유틸리티 함수
└── types/           # TypeScript 타입 정의

content/            # 마크다운 문서 저장소
```

## 라이선스

MIT License

## 작성자

- richard-kim-79
- Email: blueslap0701@gmail.com 