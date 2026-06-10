# 🏠 KB 부동산 가이드

사회초년생·신혼부부를 위한 부동산 거래 단계별 체크리스트 앱

---

## 실행 방법

### 1. Node.js 설치 확인
```bash
node -v   # v14 이상이어야 합니다
```
Node.js가 없다면 → https://nodejs.org 에서 LTS 버전 설치

### 2. 서버 실행
```bash
# 프로젝트 폴더에서
node server.js

# 또는
npm start
```

### 3. 브라우저에서 접속
```
http://localhost:3000
```

> ⚠️ `index.html`을 직접 더블클릭하면 API가 작동하지 않습니다.
> 반드시 서버를 켠 후 `http://localhost:3000` 으로 접속하세요.

---

## 폴더 구조

```
kb-realestate/
├── server.js          ← Node.js 서버 (외부 라이브러리 없음)
├── package.json
├── index.html         ← 앱 메인 화면
├── css/
│   └── style.css      ← 스타일
├── js/
│   ├── data.js        ← 체크리스트 항목 / 용어 / 챗봇 답변 데이터
│   └── app.js         ← 화면 전환, API 호출, 렌더링 로직
└── data/
    └── db.json        ← 사용자 데이터 저장소 (자동 생성·업데이트)
```

---

## 데이터 저장 구조 (`data/db.json`)

```json
{
  "lists": [
    {
      "id": "1717123456789",
      "name": "마포구 원룸",
      "type": "월세",
      "addr": "서울시 마포구 공덕동 123",
      "price": "500/45",
      "date": "2025.06.04",
      "done": 3,
      "total": 15,
      "progress": 20
    }
  ],
  "checkStates": {
    "1717123456789": {
      "0_0": true,
      "0_1": true,
      "1_0": true
    }
  }
}
```

---

## API 엔드포인트

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET    | /api/lists         | 전체 목록 조회 |
| POST   | /api/lists         | 새 목록 생성 |
| DELETE | /api/lists/:id     | 목록 삭제 |
| GET    | /api/states/:id    | 체크 상태 조회 |
| PUT    | /api/states/:id    | 체크 상태 저장 |
