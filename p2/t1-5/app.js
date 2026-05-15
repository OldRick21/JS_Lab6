const STORAGE_KEY = 'todos';
const ID_KEY = 'todo_next_id';

function getTodos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function getNextId() {
  const id = parseInt(localStorage.getItem(ID_KEY) || '1', 10);
  localStorage.setItem(ID_KEY, id + 1);
  return id;
}

const app = document.getElementById('app');

function navigate(path) {
  history.pushState(null, '', path);
  renderRoute();
}

function renderRoute() {
  const path = window.location.pathname;
  const match = path.match(/^\/task\/(\d+)(\/(delete|complete))?$/);
  const aboutMatch = path === '/about';

  if (path === '/') {
    renderTaskList();
  } else if (path === '/add') {
    renderAddForm();
  } else if (match) {
    const id = parseInt(match[1], 10);
    const action = match[3];
    if (action === 'delete') {
      performDelete(id);
    } else if (action === 'complete') {
      performToggleComplete(id);
    } else {
      renderTaskDetail(id);
    }
  } else if (aboutMatch) {
    renderAbout();
  } else {
    app.innerHTML = '<h2>Страница не найдена</h2><a href="/">На главную</a>';
  }
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link || link.host !== window.location.host) return;
  e.preventDefault();
  navigate(link.pathname);
});

window.addEventListener('popstate', renderRoute);

function renderTaskList() {
  const todos = getTodos();
  if (todos.length === 0) {
    app.innerHTML = '<p>Задач пока нет. <a href="/add">Добавить первую</a></p>';
    return;
  }

  let html = '<h2>Список задач</h2><ul>';
  todos.forEach(todo => {
    const completedClass = todo.completed ? 'completed' : '';
    html += `
      <li class="task-item">
        <a href="/task/${todo.id}" class="${completedClass}">${escapeHtml(todo.title)}</a>
        <div>
          <a href="/task/${todo.id}/complete" style="margin-right:8px;">✓</a>
          <a href="/task/${todo.id}/delete" style="color:red;">✕</a>
        </div>
      </li>`;
  });
  html += '</ul>';
  app.innerHTML = html;
}

function renderAddForm() {
  app.innerHTML = `
    <h2>Новая задача</h2>
    <form id="add-form">
      <input type="text" id="task-title" placeholder="Название задачи" required autofocus>
      <button type="submit">Добавить</button>
    </form>
    <p><a href="/">← Назад</a></p>
  `;

  document.getElementById('add-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    if (!title) return;

    const todos = getTodos();
    const newId = getNextId();        
    todos.push({ id: newId, title, completed: false });
    saveTodos(todos);

    navigate('/');   
  });
}

function renderTaskDetail(id) {
  const todos = getTodos();
  const task = todos.find(t => t.id === id);
  if (!task) {
    app.innerHTML = '<p>Задача не найдена. <a href="/">Вернуться к списку</a></p>';
    return;
  }
  const status = task.completed ? '✅ Выполнена' : '❌ Не выполнена';
  app.innerHTML = `
    <h2>Задача #${task.id}</h2>
    <p><strong>Название:</strong> ${escapeHtml(task.title)}</p>
    <p><strong>Статус:</strong> ${status}</p>
    <a href="/task/${task.id}/complete">Переключить статус</a> |
    <a href="/task/${task.id}/delete" style="color:red;">Удалить</a>
    <br><a href="/">← К списку</a>
  `;
}

function performDelete(id) {
  let todos = getTodos();
  const initialLength = todos.length;
  todos = todos.filter(t => t.id !== id);
  if (todos.length === initialLength) {
    app.innerHTML = '<p>Задача не найдена. <a href="/">Вернуться</a></p>';
    return;
  }
  saveTodos(todos);
  app.innerHTML = '<div class="message">Task deleted</div><a href="/">На список задач</a>';
}

function performToggleComplete(id) {
  let todos = getTodos();
  const task = todos.find(t => t.id === id);
  if (!task) {
    app.innerHTML = '<p>Задача не найдена. <a href="/">Вернуться</a></p>';
    return;
  }
  task.completed = !task.completed;
  saveTodos(todos);
  app.innerHTML = '<div class="message">Task status has been changed</div><a href="/">На список задач</a>';
}

function renderAbout() {
  app.innerHTML = `
    <h2>О нас</h2>
    <p>Это простой TodoList на чистом JavaScript с LocalStorage.</p>
    <p><a href="/">← На главную</a></p>
  `;
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

renderRoute();