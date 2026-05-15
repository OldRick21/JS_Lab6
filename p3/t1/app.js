const { createApp, ref, computed, defineComponent } = Vue;
const { createPinia, defineStore } = Pinia;

const useTodoStore = defineStore('todos', {
  state: () => ({
    todos: [],
    nextId: 1,
  }),
  actions: {
    loadFromStorage() {
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        this.todos = JSON.parse(savedTodos);
      }
      const savedNextId = localStorage.getItem('todo_next_id');
      if (savedNextId) {
        this.nextId = parseInt(savedNextId, 10);
      }
    },
    saveToStorage() {
      localStorage.setItem('todos', JSON.stringify(this.todos));
      localStorage.setItem('todo_next_id', this.nextId);
    },
    addTodo(title) {
      const newTodo = {
        id: this.nextId,
        title,
        completed: false,
      };
      this.todos.push(newTodo);
      this.nextId++;
      this.saveToStorage();
    },
    removeTodo(id) {
      this.todos = this.todos.filter(t => t.id !== id);
      this.saveToStorage();
    },
    toggleComplete(id) {
      const todo = this.todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        this.saveToStorage();
      }
    },
  },
  getters: {
    todoById: (state) => (id) => state.todos.find(t => t.id === id),
    allTodos: (state) => state.todos,
  },
});

const TodoList = defineComponent({
  template: `
    <div>
      <h2>Список задач</h2>
      <div v-if="todos.length === 0">
        <p>Задач пока нет. <a @click.prevent="$emit('navigate', '/add')" href="#">Добавить первую</a></p>
      </div>
      <ul v-else>
        <li v-for="todo in todos" :key="todo.id" class="task-item">
          <a @click.prevent="$emit('navigate', '/task/' + todo.id)" href="#" :class="{ completed: todo.completed }">{{ todo.title }}</a>
          <div>
            <a @click.prevent="$emit('navigate', '/task/' + todo.id + '/complete')" href="#" style="margin-right:8px;">✓</a>
            <a @click.prevent="$emit('navigate', '/task/' + todo.id + '/delete')" href="#" style="color:red;">✕</a>
          </div>
        </li>
      </ul>
    </div>
  `,
  props: ['todos'],
  emits: ['navigate'],
});

const AddTask = defineComponent({
  template: `
    <div>
      <h2>Новая задача</h2>
      <form @submit.prevent="add">
        <input type="text" v-model.trim="title" placeholder="Название задачи" required autofocus>
        <button type="submit">Добавить</button>
      </form>
      <p><a @click.prevent="$emit('navigate', '/')" href="#">← Назад</a></p>
    </div>
  `,
  data() {
    return { title: '' };
  },
  methods: {
    add() {
      if (!this.title) return;
      this.$store.addTodo(this.title);
      this.$emit('navigate', '/');
    },
  },
  inject: ['$store'],
  emits: ['navigate'],
});

const TaskDetail = defineComponent({
  template: `
    <div v-if="task">
      <h2>Задача #{{ task.id }}</h2>
      <p><strong>Название:</strong> {{ task.title }}</p>
      <p><strong>Статус:</strong> {{ task.completed ? '✅ Выполнена' : '❌ Не выполнена' }}</p>
      <a @click.prevent="$emit('navigate', '/task/' + task.id + '/complete')" href="#">Переключить статус</a> |
      <a @click.prevent="$emit('navigate', '/task/' + task.id + '/delete')" href="#" style="color:red;">Удалить</a>
      <br><a @click.prevent="$emit('navigate', '/')" href="#">← К списку</a>
    </div>
    <div v-else>
      <p>Задача не найдена. <a @click.prevent="$emit('navigate', '/')" href="#">Вернуться к списку</a></p>
    </div>
  `,
  props: ['task'],
  emits: ['navigate'],
});

const About = defineComponent({
  template: `
    <div>
      <h2>О нас</h2>
      <p>Это простой TodoList на Vue 3 и Pinia.</p>
      <p><a @click.prevent="$emit('navigate', '/')" href="#">← На главную</a></p>
    </div>
  `,
  emits: ['navigate'],
});

const DeleteMessage = defineComponent({
  template: `
    <div>
      <div class="message">Task deleted</div>
      <a @click.prevent="$emit('navigate', '/')" href="#">На список задач</a>
    </div>
  `,
  emits: ['navigate'],
});

const CompleteMessage = defineComponent({
  template: `
    <div>
      <div class="message">Task status has been changed</div>
      <a @click.prevent="$emit('navigate', '/')" href="#">На список задач</a>
    </div>
  `,
  emits: ['navigate'],
});

const App = defineComponent({
  components: {
    TodoList,
    AddTask,
    TaskDetail,
    About,
    DeleteMessage,
    CompleteMessage,
  },
  setup() {
    const store = useTodoStore();
    store.loadFromStorage();

    const currentRoute = ref(window.location.pathname);
    const routeKey = ref(0);

    const routeInfo = computed(() => {
      const path = currentRoute.value;
      if (path === '/') {
        return { name: 'list' };
      } else if (path === '/add') {
        return { name: 'add' };
      } else if (path === '/about') {
        return { name: 'about' };
      }
      const match = path.match(/^\/task\/(\d+)(\/(delete|complete))?$/);
      if (match) {
        const id = parseInt(match[1], 10);
        const action = match[3];
        return { name: 'task', id, action };
      }
      return { name: 'notFound' };
    });

    const currentComponent = computed(() => {
      const info = routeInfo.value;
      if (info.name === 'list') return 'TodoList';
      if (info.name === 'add') return 'AddTask';
      if (info.name === 'about') return 'About';
      if (info.name === 'task') {
        if (info.action === 'delete') {
          store.removeTodo(info.id);
          return 'DeleteMessage';
        } else if (info.action === 'complete') {
          store.toggleComplete(info.id);
          return 'CompleteMessage';
        } else {
          // Обычный просмотр задачи – возвращаем компонент и пропсы
          return { component: 'TaskDetail', task: store.todoById(info.id) };
        }
      }
      // notFound
      return { template: '<p>Страница не найдена. <a @click.prevent="navigate(\'/\')" href="#">На главную</a></p>' };
    });

    const taskProp = computed(() => {
      const info = routeInfo.value;
      if (info.name === 'task' && !info.action) {
        return store.todoById(info.id);
      }
      return null;
    });

    function navigate(path) {
      history.pushState(null, '', path);
      currentRoute.value = path;
      routeKey.value++;
    }

    window.addEventListener('popstate', () => {
      currentRoute.value = window.location.pathname;
      routeKey.value++;
    });

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link || link.host !== window.location.host) return;
      e.preventDefault();
      navigate(link.pathname);
    });

    return {
      currentRoute,
      routeKey,
      currentComponent,
      taskProp,
      navigate,
      store,
    };
  },
  template: `
    <component 
      :is="currentComponent" 
      :key="routeKey" 
      :todos="store.allTodos" 
      :task="taskProp"
      @navigate="navigate"
    />
  `,
});

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

app.provide('$store', useTodoStore());

app.mount('#app');