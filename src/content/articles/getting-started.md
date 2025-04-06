---
title: AI 친화적인 포털 시작하기
date: 2024-03-21
author: 관리자
tags: [시작하기, 가이드, 튜토리얼]
category: 가이드
---

# AI 친화적인 포털 시작하기

이 문서는 AI 친화적인 마크다운/JSON 기반 포털을 사용하는 방법을 안내합니다.

## 주요 기능

- 마크다운 기반 콘텐츠 작성
- JSON 형식의 메타데이터 관리
- AI 친화적인 API 엔드포인트
- 모던한 웹 인터페이스

## 콘텐츠 작성 방법

1. 마크다운 파일 생성
   ```bash
   touch src/content/articles/새로운-문서.md
   ```

2. YAML Front Matter 추가
   ```markdown
   ---
   title: 문서 제목
   date: 2024-03-21
   author: 작성자
   tags: [태그1, 태그2]
   category: 카테고리
   ---
   ```

3. 콘텐츠 작성
   - 마크다운 문법을 사용하여 콘텐츠를 작성합니다
   - 코드 블록, 이미지, 링크 등을 활용할 수 있습니다

## API 사용 방법

```javascript
// 모든 콘텐츠 조회
fetch('/api/content')
  .then(response => response.json())
  .then(data => console.log(data));

// 특정 콘텐츠 조회
fetch('/api/content?id=articles/getting-started')
  .then(response => response.json())
  .then(data => console.log(data));

// 태그로 필터링
fetch('/api/content?tag=시작하기')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 도움말

더 자세한 정보는 [문서](/docs)를 참조하세요. 