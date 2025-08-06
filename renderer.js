const calendar = document.getElementById('calendar');
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const toDoList = document.getElementById('todo-list');

const tasks = {};  // { 'YYYY-MM-DD': ['task1', 'task2'] }

function updateToDoList(dateStr) {
  toDoList.innerHTML = '';
  const dateTasks = tasks[dateStr] || [];
  dateTasks.forEach(task => {
    const li = document.createElement('li');
    li.textContent = task;
    toDoList.appendChild(li);
  });
}

addTaskButton.addEventListener('click', () => {
  const dateStr = calendar.value;
  const task = taskInput.value.trim();

  if (!dateStr || !task) return;

  if (!tasks[dateStr]) tasks[dateStr] = [];
  tasks[dateStr].push(task);
  taskInput.value = '';
  updateToDoList(dateStr);
});

calendar.addEventListener('change', () => {
  updateToDoList(calendar.value);
});

// Initialize with today
calendar.valueAsDate = new Date();
updateToDoList(calendar.value);
