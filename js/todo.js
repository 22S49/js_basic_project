// ===== 1. 데이터 =====
const STORAGE_KEY = "todo-list";   // localStorage에 저장할 이름(키)
let todos = [];                        // 할 일 목록 (id, date, time, title, content, done)
let editingId = null;                  // 수정 중인 항목의 id (추가 중이면 null)
let deletingId = null;                 // 삭제하려는 항목의 id

// ===== 2. HTML 요소 가져오기 =====
const mainInput = document.getElementById("main-input");
const openFormBtn = document.getElementById("open-form-btn");
const todoList = document.getElementById("todo-list");
const emptyMsg = document.getElementById("empty-msg");
const thumb = document.getElementById("thumb");
const clearArea = document.getElementById("clear-area");
const clearBtn = document.getElementById("clear-btn");

const formPopup = document.getElementById("form-popup");
const dateInput = document.getElementById("date-input");
const timeInput = document.getElementById("time-input");
const titleInput = document.getElementById("title-input");
const contentInput = document.getElementById("content-input");
const errorMsg = document.getElementById("error-msg");
const formOkBtn = document.getElementById("form-ok-btn");
const formCancelBtn = document.getElementById("form-cancel-btn");

const detailPopup = document.getElementById("detail-popup");
const detailTitle = document.getElementById("detail-title");
const detailDate = document.getElementById("detail-date");
const detailContent = document.getElementById("detail-content");
const detailCloseBtn = document.getElementById("detail-close-btn");

const deletePopup = document.getElementById("delete-popup");
const deleteTitle = document.getElementById("delete-title");
const deleteOkBtn = document.getElementById("delete-ok-btn");
const deleteCancelBtn = document.getElementById("delete-cancel-btn");

// ===== 3. 저장 / 불러오기 =====
function saveTodos() {
  // 배열은 그대로 저장이 안 되므로 문자열로 바꿔서 저장
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    todos = JSON.parse(saved);   // 문자열을 다시 배열로
  }
}

// ===== 4. 목록 화면에 그리기 =====
function renderTodos() {
  todoList.innerHTML = "";   // 기존 목록 비우기

  if (todos.length === 0) {
    emptyMsg.classList.remove("hidden");
    clearArea.classList.add("hidden");   // 지울 게 없으면 전체 삭제 버튼 숨김
  } else {
    emptyMsg.classList.add("hidden");
    clearArea.classList.remove("hidden");
  }

  for (let i = 0; i < todos.length; i++) {
    todoList.appendChild(makeItem(todos[i]));
  }
}

// 할 일 하나를 li 요소로 만들기
function makeItem(todo) {
  const li = document.createElement("li");
  li.className = "flex items-center justify-between px-[30px] py-3 border-b border-gray-200 hover:bg-gray-50";

  // 완료 체크 버튼 (동그라미)
  const checkBtn = document.createElement("button");
  checkBtn.className = "w-5 h-5 mt-0.5 shrink-0 rounded-full border-2 text-xs leading-none flex items-center justify-center";
  if (todo.done === true) {
    checkBtn.className += " bg-[#228B22] border-[#228B22] text-white";
    checkBtn.className += " material-symbols-outlined !text-sm";   // 머테리얼 아이콘 (!text-sm: 아이콘 크기를 14px로 강제)
    checkBtn.textContent = "check";   // 아이콘 이름
    checkBtn.title = "미완료로 표시";   // 마우스를 올리면 뜨는 말풍선
  } else {
    checkBtn.className += " border-gray-400";
    checkBtn.title = "완료로 표시";
  }
  checkBtn.addEventListener("click", function () {
    toggleDone(todo.id);
  });

  // 제목 + 날짜 (누르면 상세 팝업)
  const info = document.createElement("div");
  info.className = "cursor-pointer";
  info.addEventListener("click", function () {
    openDetailPopup(todo);
  });

  const title = document.createElement("p");
  title.className = "text-sm";
  if (todo.done === true) {
    title.className = "text-sm text-gray-400 line-through";   // 완료되면 취소선
  }
  title.textContent = todo.title;

  // 날짜/시간 라벨
  const date = document.createElement("span");
  date.className = "inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs border rounded-full";
  if (isOverdue(todo)) {
    date.className += " border-[#ffa500] text-[#ffa500]";   // 지난 날짜는 주황색으로
  } else {
    date.className += " border-gray-300 text-gray-500";
  }

  // 라벨 안에 시계 아이콘 + 날짜 글자 (아이콘은 항상 표시)
  const dateIcon = document.createElement("span");
  dateIcon.className = "material-symbols-outlined !text-[11.5px] relative top-px";
  dateIcon.textContent = "schedule";

  const dateText = document.createElement("span");
  dateText.textContent = makeDateText(todo);

  date.appendChild(dateIcon);
  date.appendChild(dateText);

  info.appendChild(title);
  info.appendChild(date);

  // 수정, 삭제 버튼
  const buttons = document.createElement("div");
  buttons.className = "flex gap-2 self-end";

  const editBtn = document.createElement("button");
  editBtn.textContent = "수정";
  editBtn.className = "text-xs py-0.5 border border-transparent text-[#228B22] hover:font-bold";
  editBtn.addEventListener("click", function () {
    openEditPopup(todo.id);
  });

  const delBtn = document.createElement("button");
  delBtn.textContent = "삭제";
  delBtn.className = "text-xs py-0.5 border border-transparent text-[#f87171] hover:font-bold";
  delBtn.addEventListener("click", function () {
    openDeletePopup(todo.id);
  });

  buttons.appendChild(editBtn);
  buttons.appendChild(delBtn);

  // 왼쪽(체크 + 제목/날짜), 오른쪽(수정/삭제)
  const left = document.createElement("div");
  left.className = "flex items-start gap-3";
  left.appendChild(checkBtn);
  left.appendChild(info);

  li.appendChild(left);
  li.appendChild(buttons);
  return li;
}

// 날짜가 오늘보다 이전이면 true (완료한 항목이나 날짜가 없는 항목은 false)
function isOverdue(todo) {
  if (todo.done === true || !todo.date) {
    return false;
  }

  // 오늘 날짜를 "2026-10-02" 형식의 글자로 만들어 비교
  const now = new Date();
  let month = now.getMonth() + 1;   // getMonth()는 0부터 시작해서 +1
  let day = now.getDate();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  const today = now.getFullYear() + "-" + month + "-" + day;

  // 같은 형식의 글자끼리는 크기 비교로 날짜 앞뒤를 알 수 있음
  return todo.date < today;
}

// 날짜와 시간을 보여줄 글자로 만들기 (예: "2026-10-02 10:30")
function makeDateText(todo) {
  let text = "";
  if (todo.date) {
    // "2026-10-02"를 "-" 기준으로 잘라서 [년, 월, 일]로 만들기
    const parts = todo.date.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);   // Number()로 "02"를 2로 바꿈
    const day = Number(parts[2]);

    if (year === new Date().getFullYear()) {
      text = month + "월 " + day + "일";                 // 올해: 10월 2일
    } else {
      text = year + "년 " + month + "월 " + day + "일";   // 다른 해: 2027년 5월 22일
    }
  }
  if (todo.time) {   // 이전에 저장한 데이터는 time이 없을 수 있음
    text = (text + " " + todo.time).trim();
  }
  if (text === "") {
    text = "날짜 없음";
  }
  return text;
}

// 완료 체크 바꾸기
function toggleDone(id) {
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id === id) {
      todos[i].done = !(todos[i].done === true);   // true면 false로, 아니면 true로

      if (todos[i].done === true) {
        showThumb();   // 완료로 바뀔 때만 따봉 보여주기
      }
    }
  }
  saveTodos();
  renderTodos();
}

// 따봉을 보여주고 1초 뒤에 숨기기
function showThumb() {
  thumb.classList.remove("hidden");
  setTimeout(function () {
    thumb.classList.add("hidden");
  }, 1000);   // 1000 = 1초
}

// ===== 상세 보기 팝업 =====
function openDetailPopup(todo) {
  detailTitle.textContent = todo.title;

  detailDate.textContent = makeDateText(todo);

  if (todo.content === "") {
    detailContent.textContent = "내용 없음";
  } else {
    detailContent.textContent = todo.content;
  }

  detailPopup.classList.remove("hidden");
}

function closeDetailPopup() {
  detailPopup.classList.add("hidden");
}

// ===== 5. 추가 / 수정 팝업 =====

// 빠른 추가: 제목만 넣고 바로 등록 (날짜, 시간, 내용은 비워둠)
function quickAdd() {
  const title = mainInput.value.trim();
  if (title === "") {
    return;   // 비어 있으면 아무것도 안 함
  }

  todos.push({
    id: Date.now(),
    date: "",
    time: "",
    title: title,
    content: "",
    done: false
  });

  mainInput.value = "";
  saveTodos();
  renderTodos();
}

// 상세 설정: 메인 입력값을 제목으로 옮겨서 팝업 열기
function openAddPopup() {
  editingId = null;
  dateInput.value = "";
  timeInput.value = "";
  titleInput.value = mainInput.value;
  contentInput.value = "";
  errorMsg.textContent = "";
  formPopup.classList.remove("hidden");
  titleInput.focus();   // 바로 제목을 입력할 수 있게
}

function openEditPopup(id) {
  // id가 같은 항목 찾기 (찾으면 값이 바뀌므로 let)
  let todo = null;
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id === id) {
      todo = todos[i];
    }
  }

  editingId = id;
  dateInput.value = todo.date;
  if (todo.time) {
    timeInput.value = todo.time;
  } else {
    timeInput.value = "";   // 이전에 저장한 데이터는 time이 없음
  }
  titleInput.value = todo.title;
  contentInput.value = todo.content;
  errorMsg.textContent = "";
  formPopup.classList.remove("hidden");
  titleInput.focus();
}

function closeFormPopup() {
  formPopup.classList.add("hidden");
}

// '저장' 버튼 (추가일 때와 수정일 때 모두)
function submitForm() {
  const title = titleInput.value.trim();   // 앞뒤 공백 제거

  if (title === "") {
    errorMsg.textContent = "제목을 입력하세요.";
    return;   // 팝업은 그대로 두고 끝
  }

  if (editingId === null) {
    // 새로 추가
    const newTodo = {
      id: Date.now(),   // 현재 시간(숫자)을 고유 id로 사용
      date: dateInput.value,
      time: timeInput.value,
      title: title,
      content: contentInput.value,
      done: false   // 완료 여부
    };
    todos.push(newTodo);
    mainInput.value = "";   // 메인 입력창 비우기
  } else {
    // 선택한 항목만 수정
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].id === editingId) {
        todos[i].date = dateInput.value;
        todos[i].time = timeInput.value;
        todos[i].title = title;
        todos[i].content = contentInput.value;
      }
    }
  }

  saveTodos();
  renderTodos();
  closeFormPopup();
}

// ===== 6. 삭제 팝업 =====
function openDeletePopup(id) {
  deletingId = id;
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id === id) {
      deleteTitle.textContent = todos[i].title;
    }
  }
  deletePopup.classList.remove("hidden");
}

function closeDeletePopup() {
  deletePopup.classList.add("hidden");
}

function confirmDelete() {
  const newTodos = [];   // push로 내용만 추가하고 변수 자체는 안 바뀌므로 const
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id !== deletingId) {   // 삭제할 항목만 빼고 담기
      newTodos.push(todos[i]);
    }
  }
  todos = newTodos;

  saveTodos();
  renderTodos();
  closeDeletePopup();
}

// 전체 삭제 (확인창에서 '확인'을 눌렀을 때만)
function clearAll() {
  const ok = confirm("할 일을 모두 삭제할까요? 되돌릴 수 없습니다.");
  if (ok === false) {
    return;
  }

  todos = [];
  localStorage.removeItem(STORAGE_KEY);   // 저장된 데이터도 지우기
  renderTodos();
}

// ===== 7. 버튼에 기능 연결 =====
clearBtn.addEventListener("click", clearAll);
mainInput.addEventListener("keydown", function (event) {
  // isComposing: 한글 조합 중일 때 Enter가 두 번 눌리는 것을 막기
  if (event.key === "Enter" && event.isComposing === false) {
    quickAdd();
  }
});
openFormBtn.addEventListener("click", openAddPopup);
formOkBtn.addEventListener("click", submitForm);
formCancelBtn.addEventListener("click", closeFormPopup);
detailCloseBtn.addEventListener("click", closeDetailPopup);
deleteOkBtn.addEventListener("click", confirmDelete);
deleteCancelBtn.addEventListener("click", closeDeletePopup);

// ===== 8. 앱 시작 =====
loadTodos();
renderTodos();
