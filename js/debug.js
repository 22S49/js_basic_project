// todo.js의 STORAGE_KEY와 같은 이름이어야 같은 데이터를 읽음
const STORAGE_KEY = "todo-list";

const keyName = document.getElementById("key-name");
const output = document.getElementById("output");
const totalCount = document.getElementById("total-count");
const doneCount = document.getElementById("done-count");
const updatedAt = document.getElementById("updated-at");

let lastSaved = null;   // 지난번에 읽은 값 (바뀌었는지 비교용)

keyName.textContent = STORAGE_KEY;

function refresh() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === lastSaved) {
    return;   // 바뀐 게 없으면 아무것도 안 함
  }
  lastSaved = saved;

  // 저장된 게 없을 때
  if (saved === null) {
    output.textContent = "저장된 데이터가 없습니다.";
    totalCount.textContent = 0;
    doneCount.textContent = 0;
  } else {
    const todos = JSON.parse(saved);

    // 보기 좋게 들여쓰기해서 보여주기 (2칸)
    output.textContent = JSON.stringify(todos, null, 2);

    // 완료 개수 세기
    let done = 0;
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].done === true) {
        done++;
      }
    }
    totalCount.textContent = todos.length;
    doneCount.textContent = done;
  }

  updatedAt.textContent = new Date().toLocaleTimeString();
}

refresh();
setInterval(refresh, 500);   // 0.5초마다 다시 읽기
