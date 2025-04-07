---
title: AI Tree Portal
emoji: 🌳
colorFrom: green
colorTo: blue
sdk: docker
app_port: 3000
pinned: false
license: mit
---

# AI Tree Portal

AI 관련 문서와 리소스를 관리하는 지식 포털입니다.

## 주요 기능

- 📝 마크다운 기반 문서 관리
  - 실시간 미리보기
  - 태그 및 카테고리 지원
  - 버전 관리

- 🔍 검색 기능
  - 전체 텍스트 검색
  - 태그 기반 필터링
  - 카테고리 탐색

- 🎯 인센티브 시스템
  - 포인트 시스템
  - 기여도 순위
  - NFT 보상

- 🔄 실시간 업데이트
  - WebSocket 기반 알림
  - 실시간 협업
  - 변경사항 추적

## 기술 스택

- Frontend: Next.js, React, TypeScript
- Backend: Next.js API Routes
- Database: SQLite, Prisma
- 검색: Meilisearch
- 실시간: WebSocket
- 스타일: Tailwind CSS

## 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 환경 변수

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## API 엔드포인트

- GraphQL: `/api/graphql`
- WebSocket: `ws://localhost:3000/api/graphql`
- REST API: `/api/v1/*`

## 라이선스

MIT License 