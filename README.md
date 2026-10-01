# Todo 웹 문서 구현

구글 Tasks를 참고해 만든 Todo 웹 문서입니다.   
HTML, Tailwind CSS, JavaScript로 만들었고, 데이터는 브라우저 localStorage에 저장합니다.

<br>

## 🚀 실행 방법

`index.html`을 브라우저로 엽니다.  

저장된 데이터를 보고 싶으면 `index.html`과 같은 방식으로  `debug.html`을 다른 탭에 열면 됩니다.  
할 일 내역이 업데이트될 때마다 0.5초 안에 화면이 갱신됩니다.

<br>

## 📁 폴더 구조

```text
index.html      화면 구조와 Tailwind 연결
debug.html      저장 데이터 확인용 페이지
js/todo.js      DOM 동작과 데이터 저장
js/debug.js     debug.html 동작
css/style.css   추가 스타일 (팝업, 따봉 애니메이션, 폰트)
```
<br>

## 🌳 DOM 트리

### 📄 index.html

`#`이 붙은 이름은 `id`이고, JS가 `document.getElementById`로 찾아서 씁니다.

```text
html
├─ head
│   ├─ meta (charset, viewport)
│   ├─ title
│   ├─ script (Tailwind CDN)
│   └─ link × 4 (style.css, Noto Sans KR, Material Symbols, 파비콘)
└─ body
    ├─ div 카드 (흰색, 세로 flex)
    │   ├─ div 헤더
    │   │   ├─ span 원형 배경
    │   │   │   └─ span 아이콘 (task_alt)
    │   │   └─ h1 "Todo"
    │   ├─ div 빠른 추가
    │   │   ├─ span 아이콘 (add_task)
    │   │   ├─ input #main-input
    │   │   └─ button #open-form-btn (edit_note 아이콘)
    │   ├─ ul #todo-list            ← JS가 li를 채움 (아래 참고)
    │   ├─ p #empty-msg             ← 목록이 비면 표시
    │   └─ div #clear-area          ← 목록이 비면 숨김
    │       └─ button #clear-btn
    │           ├─ span 아이콘 (delete)
    │           └─ 텍스트 "전체 삭제"
    │
    ├─ div #form-popup (.popup)     ← 추가/수정 팝업
    │   └─ div 카드
    │       ├─ div
    │       │   └─ button #form-cancel-btn (close 아이콘)
    │       ├─ div 제목
    │       │   ├─ input #title-input
    │       │   └─ p #error-msg
    │       ├─ div 날짜·시간
    │       │   ├─ span 아이콘 (event)
    │       │   ├─ input #date-input
    │       │   └─ input #time-input
    │       ├─ div 내용
    │       │   ├─ span 아이콘 (notes)
    │       │   └─ textarea #content-input
    │       └─ div
    │           └─ button #form-ok-btn "저장"
    │
    ├─ div #detail-popup (.popup)   ← 상세 보기 팝업
    │   └─ div 카드
    │       ├─ h2 #detail-title
    │       ├─ p #detail-date
    │       ├─ p #detail-content
    │       └─ div
    │           └─ button #detail-close-btn "닫기"
    │
    ├─ div #delete-popup (.popup)   ← 삭제 확인 팝업
    │   └─ div 카드
    │       ├─ h2 #delete-title
    │       ├─ p "이 할 일을 삭제할까요?"
    │       └─ div
    │           ├─ button #delete-cancel-btn "취소"
    │           └─ button #delete-ok-btn "삭제"
    │
    ├─ div #thumb "👍"              ← 완료 체크할 때만 잠깐 표시
    └─ script (js/todo.js)
```

### 🧩 할 일 항목별 구조 (JS가 붙이는 DOM)

`todo.js`의 `makeItem`이 할 일 하나마다 `createElement`로 요소를 만들고  
`appendChild`로 조립합니다. 이렇게 만든 `li`를 `renderTodos`가 `#todo-list`에 붙입니다.

```text
ul #todo-list
└─ li × 할 일 개수
    ├─ div left
    │   ├─ button checkBtn          (완료이면 check 아이콘이 들어감)
    │   └─ div info                 (누르면 상세 팝업)
    │       ├─ p title              (완료이면 취소선)
    │       └─ span date            (지난 날짜이면 주황색)
    │           ├─ span dateIcon    (schedule 아이콘)
    │           └─ span dateText    (예: "10월 2일 10:30")
    └─ div buttons
        ├─ button editBtn "수정"
        └─ button delBtn "삭제"
```

### 🔀 화면 상태에 따라 바뀌는 부분 (요소 표현)

JS는 요소를 새로 만들거나 지우는 대신,  
미리 만들어 둔 요소의 `hidden` 클래스를 넣고 빼서 보이고 숨깁니다.

| 상황 | 바뀌는 요소 |
| --- | --- |
| 목록이 비어 있음 | `#empty-msg` 표시, `#clear-area` 숨김 |
| 목록에 항목이 있음 | `#empty-msg` 숨김, `#clear-area` 표시 |
| 빠른 추가 입력창의 상세 설정 버튼 | `#form-popup` 표시 (`#title-input`에 입력값 옮김) |
| 항목의 수정 | `#form-popup` 표시 (기존 값 채움) |
| 항목의 제목·날짜 | `#detail-popup` 표시 |
| 항목의 삭제 | `#delete-popup` 표시 |
| 항목을 완료로 체크 | `#thumb`를 1초 동안 표시 |
| 제목 없이 저장 | `#error-msg`에 문구 표시 |
| 추가·수정·삭제·체크 | `#todo-list`를 비우고 `li`를 모두 다시 만듦 |

### 🐞 debug.html

```text
html
├─ head (meta, title, Tailwind, style.css, 폰트, 파비콘)
└─ body
    ├─ div 카드
    │   ├─ h1 "저장 데이터 확인"
    │   ├─ p
    │   │   └─ code #key-name
    │   ├─ div 요약
    │   │   ├─ span
    │   │   │   └─ b #total-count
    │   │   ├─ span
    │   │   │   └─ b #done-count
    │   │   └─ span
    │   │       └─ span #updated-at
    │   └─ pre #output              ← 저장된 JSON을 보여줌
    └─ script (js/debug.js)
```
<br>

## 📋 팀 공통 기획 구조


| 영역 | 기본 구조 |
| --- | --- |
| 메인 화면 | 입력창 / 추가·수정·삭제 버튼 / 목록에 제목·날짜 / '등록된 할 일이 없음' 표시 |
| 추가 팝업 | 날짜·제목·내용 입력 / 추가·취소 버튼 / 메인 입력값을 제목으로 옮겨서 열기 |
| 수정 팝업 | 추가 팝업과 같은 구성 / 기존 값을 채워 열기 / 저장·취소 버튼 |
| 삭제 팝업 | 제목과 '이 할 일을 삭제할까요?' 표시 / 삭제·취소 버튼 |
| 입력 규칙 | 제목 필수(공백 방지, '제목을 입력하세요' 표시) / 날짜·내용 선택 / '날짜 없음' 표시 |
| 저장 방식 | CRUD를 확정할 때만 반영하고, 취소하면 변경을 버림 / localStorage에 저장 |
| 기타 사항 | 고유 id(Date.now())로 같은 제목의 항목도 구분 / 새로고침해도 목록 유지 |
| 심화 영역 | 완료 체크 / 완료 개수 / 검색·정렬 / 별도 상세 화면 등 |

### 🔄 팀 공통 기획 구조에서 달라진 점

팀 공통 기획 구조 위에 구글 Tasks 프로덕트에 가깝게 스타일과 동작을 가감했습니다.

#### ➕ 추가한 것

| 항목 | 공통 기획 | 개인 구현 |
| --- | --- | --- |
| 시간 요소 | `date`, `title`, `content`만 저장 | `time` 항목 추가 |
| 완료 체크 | 심화 영역 | 완료 표시 및 따봉 효과 추가 |
| 상세 보기 | 내용은 수정 팝업에서 확인 | 내용은 항목의 제목을 눌러 확인 가능 |
| 전체 삭제 | 없음 | 카드 우측 하단 버튼으로 추가 |
| 지난 날짜 | 없음 | 오늘보다 이전 날짜는 주황색 표시 |
| 날짜 표시 | 저장된 날짜 그대로 표시 | `YYYY년 M월 D일` 형식으로 표시 |
| 디버깅 문서 | 없음 | `debug.html` (데이터 실시간 확인) |

#### ✏️ 변경한 것

| 항목 | 공통 기획 | 개인 구현 |
| --- | --- | --- |
| 버튼 구성 | 추가, 수정, 취소, 저장 | 우상단 [ X ] 취소, 추가·수정 일괄 저장 |
| 퀵애드 기능 | 메인입력값을 제목으로 팝업 열림 | 입력창에 제목만 쓰고 바로 등록 가능 |

<br>

## 💭 아쉬운 점

### 🚧 만들지 못한 기능
- 완료 / 미완료 상태에 따라 목록을 정렬하거나 그룹화
- 전체 삭제 같은 작업의 일시와 내용 기록
- 완료 개수 표시, 검색 기능

### 🖱️ 사용성
- 팝업을 `Esc`로 닫거나 팝업의 제목칸에서 `Enter`로 저장하지 못합니다. 
- 팝업 바깥(어두운 배경)을 눌러도 닫히지 않습니다.
- 지난 날짜 판정이 날짜만 비교합니다. 오늘 날짜는 시간이 지나도 표시가 바뀌지 않습니다.
- 지난 날짜 표시는 자정을 넘겨도 화면을 그대로 두면 바뀌지 않습니다.
- 날짜 입력칸의 표시 형식(`mm/dd/yyyy` 등)은 브라우저 언어 설정을 따라서 바꿀 수 없습니다.

### 🛡️ 안정성
- 저장된 데이터가 깨져 있으면 `JSON.parse`가 실패해서 목록이 표시되지 않습니다.
- 제목 길이 제한이 없어서 아주 긴 제목이 레이아웃을 깨뜨릴 수 있습니다.
- 데이터 저장 키 이름을 바꿀 때 이전 데이터를 옮겨 주는 코드가 없습니다.
