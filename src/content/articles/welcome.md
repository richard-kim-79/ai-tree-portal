---
title: AI 친화적인 포털에 오신 것을 환영합니다
date: 2024-03-21
author: 관리자
tags: [시작하기, 소개]
category: 소개
---

# AI 친화적인 포털에 오신 것을 환영합니다

이 포털은 AI가 쉽게 이해하고 활용할 수 있는 마크다운과 JSON 기반의 콘텐츠 관리 시스템입니다.

## 주요 특징

- 마크다운 기반 콘텐츠 작성
- JSON 형식의 메타데이터 관리
- AI 친화적인 API 엔드포인트
- 모던한 웹 인터페이스

## 시작하기

1. 콘텐츠 작성
   - 마크다운 형식으로 문서를 작성합니다
   - YAML Front Matter를 사용하여 메타데이터를 추가합니다

2. API 활용
   - `/api/content` 엔드포인트를 통해 콘텐츠에 접근
   - `/api/search`를 사용하여 콘텐츠 검색

## 예제 코드

```javascript
// API 호출 예제
fetch('/api/content')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 도움말

더 자세한 정보는 [문서](/docs)를 참조하세요. 