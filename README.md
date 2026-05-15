# Лабораторная работа 6 — VeeValidate, Vue Router и Pinia

**Темы:** Валидация форм, клиентский роутинг через History API, централизованное хранилище состояния.

---

## p1 — VeeValidate (`t1-5/`)

Vite-проект: форма регистрации с покомпонентной валидацией.

```
src/
  App.vue              — монтирует RegisterForm
  components/
    RegisterForm.vue   — вся логика формы и стили
  main.js
```

### RegisterForm.vue
Три поля, каждое обёрнуто в `<Field>` из VeeValidate:

| Поле | Правило |
|------|---------|
| Email | обязателен, regex `[^@]+@[^@]+\.[^@]+` |
| Password | ≥8 символов, цифра, строчная, прописная, спецсимвол |
| Checkbox | обязателен (согласие с лицензией) |

- Поле подсвечивается зелёным/красным через CSS-классы `input--success` / `input--error` в зависимости от `fieldMeta.valid`.
- Под полем пароля — живой список критериев (`criteria`), каждый пункт меняет цвет по мере ввода.
- Кнопка Submit заблокирована (`disabled`) пока форма не валидна (`!meta.valid`).
- `<ErrorMessage>` выводит текст ошибки под каждым полем.

### Запуск

```bash
cd p1/t1-5
npm install
npm run dev
```

---

## p2 — Vue Router (`t1-5/`)

SPA на чистом JS (без фреймворка) с History API.

**Файлы:** `index.html`, `app.js`, `bin.sh`

### Маршруты

| Путь | Что рендерится |
|------|----------------|
| `/` | Список задач из localStorage |
| `/add` | Форма добавления новой задачи |
| `/task/:id` | Детальная страница задачи |
| `/task/:id/complete` | Переключение статуса задачи |
| `/task/:id/delete` | Удаление задачи |
| `/about` | Страница «О нас» |

### Как работает роутинг (`app.js`)
- `navigate(path)` вызывает `history.pushState()` и `renderRoute()`.
- `renderRoute()` читает `window.location.pathname`, парсит его через regex и вызывает нужную функцию рендера.
- Клик на любую ссылку перехватывается глобальным делегатом на `document` — SPA-навигация без перезагрузки.
- `popstate` (кнопка «назад» браузера) тоже вызывает `renderRoute()`.
- Данные хранятся в `localStorage` через `getTodos()` / `saveTodos()`.

### Запуск
Откройте `index.html` через Live Server (нужен сервер из-за History API — `file://` не работает).

---

## p3 — Pinia (`t1/`)

Todo-приложение на Vue 3 + Pinia, подключённых через CDN.

**Файлы:** `index.html`, `app.js`, `bin.sh`

### Структура `app.js`

**Store** (`useTodoStore`):
| Часть | Содержимое |
|-------|------------|
| `state` | `todos[]`, `nextId` |
| `actions` | `loadFromStorage`, `saveToStorage`, `addTodo`, `removeTodo`, `toggleComplete` |
| `getters` | `todoById(id)`, `allTodos` |

Каждое изменение стора синхронизируется с `localStorage`.

**Компоненты** (через `defineComponent`):
| Компонент | Назначение |
|-----------|------------|
| `TodoList` | Список задач с ссылками на просмотр, отметку выполнения и удаление |
| `AddTask` | Форма добавления задачи, работает со стором через `inject('$store')` |
| `TaskDetail` | Детальная страница задачи |
| `About` | Статичная страница «О нас» |
| `DeleteMessage` / `CompleteMessage` | Уведомления после действий |

**Роутинг** в корневом компоненте `App`:
- `currentRoute` — реактивный `ref` с текущим путём.
- `routeInfo` computed — парсит путь (regex для `/task/:id/(delete|complete)?`).
- `currentComponent` computed — возвращает имя компонента для `<component :is="...">`.
- Навигация через `history.pushState` + `popstate`.

### Запуск
Откройте `index.html` через Live Server.
