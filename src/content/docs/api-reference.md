---
title: API 참조 문서
date: 2024-03-21
author: 관리자
tags: [API, 참조, 문서]
category: 문서
---

# API 참조 문서

이 문서는 AI 친화적인 포털의 API 엔드포인트를 설명합니다.

## 콘텐츠 API

### 모든 콘텐츠 조회

```http
GET /api/content
```

응답 예시:
```json
[
  {
    "id": "articles/getting-started",
    "title": "AI 친화적인 포털 시작하기",
    "date": "2024-03-21",
    "author": "관리자",
    "tags": ["시작하기", "가이드", "튜토리얼"],
    "category": "가이드",
    "content": "..."
  }
]
```

### 특정 콘텐츠 조회

```http
GET /api/content?id=articles/getting-started
```

### 태그로 필터링

```http
GET /api/content?tag=시작하기
```

### 카테고리로 필터링

```http
GET /api/content?category=가이드
```

## 응답 형식

### 성공 응답

```json
{
  "id": "string",
  "title": "string",
  "date": "string",
  "author": "string",
  "tags": ["string"],
  "category": "string",
  "content": "string"
}
```

### 에러 응답

```json
{
  "error": "string"
}
```

## 상태 코드

- 200: 성공
- 404: 콘텐츠를 찾을 수 없음
- 500: 서버 에러

## 사용 예시

```javascript
// 모든 콘텐츠 조회
const response = await fetch('/api/content');
const data = await response.json();

// 특정 콘텐츠 조회
const response = await fetch('/api/content?id=articles/getting-started');
const data = await response.json();

// 태그로 필터링
const response = await fetch('/api/content?tag=시작하기');
const data = await response.json();
``` 