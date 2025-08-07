class TodoApp {
  constructor() {
    this.calendar = document.getElementById('calendar');
    this.taskTitle = document.getElementById('task-title');
    this.taskBody = document.getElementById('task-body');
    this.addTaskButton = document.getElementById('add-task');
    this.todoList = document.getElementById('todo-list');
    this.selectedDate = document.getElementById('selected-date');
    this.taskCount = document.getElementById('task-count');
    this.totalTasks = document.getElementById('total-tasks');
    this.completedTasks = document.getElementById('completed-tasks');
    this.remainingTasks = document.getElementById('remaining-tasks');
    this.summaryTableBody = document.getElementById('summary-table-body');
    this.saveStatus = document.getElementById('save-status');
    
    // Edit modal elements
    this.editModal = document.getElementById('edit-modal');
    this.editTitle = document.getElementById('edit-title');
    this.editDescription = document.getElementById('edit-description');
    this.currentEditTask = null;
    
    // Pagination properties
    this.currentPage = 1;
    this.pageSize = 25;
    this.filteredTasks = [];
    
    // Initialize tasks object
    this.tasks = {};
    
    this.init();
  }

  async init() {
    // Set default date to today
    this.calendar.valueAsDate = new Date();
    
    // Load data from CSV on startup
    await this.loadDataFromCSV();
    
    // Event listeners
    this.addTaskButton.addEventListener('click', () => this.addTask());
    this.taskTitle.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });
    this.taskBody.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) this.addTask();
    });
    this.calendar.addEventListener('change', () => this.updateView());
    
    // Modal event listeners
    this.editModal.addEventListener('click', (e) => {
      if (e.target === this.editModal) {
        this.closeEditModal();
      }
    });
    
    // Set up Electron IPC listeners if available
    if (window.electronAPI) {
      window.electronAPI.onRequestSave(() => {
        this.saveDataToCSV();
      });
      
      window.electronAPI.onRequestFinalSave(() => {
        this.saveDataToCSV().then(() => {
          // Data saved, app can close now
        });
      });
    }
    
    // Auto-save every 30 seconds (fallback for browser)
    setInterval(() => this.autoSave(), 30000);
    
    // Save data when page is about to close (browser fallback)
    window.addEventListener('beforeunload', () => this.autoSave());
    
    // Initial view update
    this.updateView();
    this.updateSummaryTable();
  }

  async loadDataFromCSV() {
    try {
      if (window.electronAPI) {
        // Electron environment - use IPC
        const result = await window.electronAPI.loadTasksCSV();
        if (result.success) {
          this.tasks = result.data;
          this.showSaveStatus('Data loaded from CSV', 'success');
        } else {
          console.error('Error loading CSV:', result.error);
          this.tasks = {};
        }
      } else {
        // Browser fallback - use localStorage
        this.loadData();
      }
    } catch (error) {
      console.error('Error loading data from CSV:', error);
      this.tasks = {};
    }
  }

  async saveDataToCSV() {
    try {
      if (window.electronAPI) {
        // Electron environment - use IPC to save CSV
        const result = await window.electronAPI.saveTasksCSV(this.tasks);
        if (result.success) {
          this.showSaveStatus('Data saved to CSV', 'success');
        } else {
          this.showSaveStatus('Error saving data', 'error');
          console.error('Error saving CSV:', result.error);
        }
      } else {
        // Browser fallback - use localStorage
        this.saveData();
        this.showSaveStatus('Data saved locally', 'success');
      }
    } catch (error) {
      console.error('Error saving data to CSV:', error);
      this.showSaveStatus('Error saving data', 'error');
    }
  }

  autoSave() {
    // Only auto-save in browser mode (Electron handles its own save timing)
    if (!window.electronAPI) {
      this.saveData();
    }
  }

  showSaveStatus(message, type = 'success') {
    this.saveStatus.textContent = message;
    this.saveStatus.className = `save-status ${type} show`;
    
    setTimeout(() => {
      this.saveStatus.classList.remove('show');
    }, 3000);
  }

  // Browser fallback methods
  loadData() {
    try {
      const savedData = localStorage.getItem('todoAppData');
      if (savedData) {
        this.tasks = JSON.parse(savedData);
      } else {
        this.tasks = {};
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.tasks = {};
    }
  }

  saveData() {
    try {
      localStorage.setItem('todoAppData', JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  async addTask() {
    const dateStr = this.calendar.value;
    const taskTitle = this.taskTitle.value.trim();
    const taskBody = this.taskBody.value.trim();

    if (!dateStr || !taskTitle) return;

    if (!this.tasks[dateStr]) {
      this.tasks[dateStr] = [];
    }

    const task = {
      id: Date.now(),
      title: taskTitle,
      body: taskBody,
      completed: false,
      createdAt: new Date().toLocaleTimeString()
    };

    this.tasks[dateStr].push(task);
    this.taskTitle.value = '';
    this.taskBody.value = '';
    
    // Save immediately when task is added
    await this.saveDataToCSV();
    
    this.updateView();
    this.updateSummaryTable();
  }

  async deleteTask(dateStr, taskId) {
    if (this.tasks[dateStr]) {
      this.tasks[dateStr] = this.tasks[dateStr].filter(task => task.id !== taskId);
      if (this.tasks[dateStr].length === 0) {
        delete this.tasks[dateStr];
      }
      await this.saveDataToCSV();
      this.updateView();
      this.updateSummaryTable();
    }
  }

  async toggleTask(dateStr, taskId) {
    if (this.tasks[dateStr]) {
      const task = this.tasks[dateStr].find(task => task.id === taskId);
      if (task) {
        task.completed = !task.completed;
        await this.saveDataToCSV();
        this.updateView();
        this.updateSummaryTable();
      }
    }
  }

  updateView() {
    const dateStr = this.calendar.value;
    const dateTasks = this.tasks[dateStr] || [];
    
    // Update date display
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    let dateLabel;
    
    if (date.toDateString() === today.toDateString()) {
      dateLabel = "Today's Tasks";
    } else if (date.toDateString() === new Date(today.getTime() + 86400000).toDateString()) {
      dateLabel = "Tomorrow's Tasks";
    } else {
      dateLabel = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    this.selectedDate.textContent = dateLabel;
    this.taskCount.textContent = `${dateTasks.length} task${dateTasks.length !== 1 ? 's' : ''}`;
    
    // Update task list (VIEW ONLY - no edit/delete buttons)
    this.todoList.innerHTML = '';
    
    if (dateTasks.length === 0) {
      this.todoList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div>No tasks for this date</div>
          <div style="font-size: 14px; margin-top: 5px;">Add a task above to get started!</div>
        </div>
      `;
    } else {
      dateTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
          <div class="task-content">
            <div class="task-text ${task.completed ? 'completed' : ''}">
              <div class="task-title">${task.title}</div>
              ${task.body ? `<div class="task-description">${task.body}</div>` : ''}
            </div>
            <div class="task-time">${task.createdAt}</div>
          </div>
        `;
        this.todoList.appendChild(li);
      });
    }
    
    // Update stats
    const completed = dateTasks.filter(task => task.completed).length;
    const total = dateTasks.length;
    const remaining = total - completed;
    
    this.totalTasks.textContent = total;
    this.completedTasks.textContent = completed;
    this.remainingTasks.textContent = remaining;
  }

  updateSummaryTable() {
    const statusFilter = document.getElementById('status-filter').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    
    let allTasksCount = 0;
    let completedTasksCount = 0;
    let pendingTasksCount = 0;
    let activeDatesCount = Object.keys(this.tasks).length;
    
    // Collect and filter all tasks
    this.filteredTasks = [];
    
    const sortedDates = Object.keys(this.tasks).sort();
    
    sortedDates.forEach(dateStr => {
      const tasks = this.tasks[dateStr];
      tasks.forEach(task => {
        allTasksCount++;
        
        if (task.completed) {
          completedTasksCount++;
        } else {
          pendingTasksCount++;
        }
        
        // Apply filters
        const matchesStatus = statusFilter === 'all' || 
          (statusFilter === 'completed' && task.completed) ||
          (statusFilter === 'pending' && !task.completed);
        
        const matchesSearch = task.title.toLowerCase().includes(searchQuery) ||
          (task.body && task.body.toLowerCase().includes(searchQuery));
        
        if (matchesStatus && matchesSearch) {
          this.filteredTasks.push({
            ...task,
            dateStr: dateStr
          });
        }
      });
    });
    
    // Reset to first page when filters change
    this.currentPage = 1;
    
    // Render paginated table
    this.renderPaginatedTable();
    this.renderPagination();
    
    // Update summary stats
    document.getElementById('all-total-tasks').textContent = allTasksCount;
    document.getElementById('all-completed-tasks').textContent = completedTasksCount;
    document.getElementById('all-pending-tasks').textContent = pendingTasksCount;
    document.getElementById('dates-with-tasks').textContent = activeDatesCount;
  }

  renderPaginatedTable() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedTasks = this.filteredTasks.slice(startIndex, endIndex);
    
    this.summaryTableBody.innerHTML = '';
    
    paginatedTasks.forEach(task => {
      const row = document.createElement('tr');
      const formattedDate = new Date(task.dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const taskId = `task-${task.dateStr}-${task.id}`;
      const hasBody = task.body && task.body.trim().length > 0;
      
      row.innerHTML = `
        <td><span class="date-badge">${formattedDate}</span></td>
        <td onclick="todoApp.toggleTaskDetails('${taskId}')">
          <div class="task-summary-title">${task.title}</div>
          ${hasBody ? `
            <div class="task-summary-preview" id="preview-${taskId}">${task.body}</div>
            <div class="task-summary-full" id="full-${taskId}">${task.body}</div>
            <div class="expand-indicator" id="indicator-${taskId}">Click to expand</div>
          ` : ''}
        </td>
        <td>
          <div class="task-checkbox ${task.completed ? 'completed' : ''}" 
               onclick="todoApp.toggleTaskFromSummary('${task.dateStr}', ${task.id})"></div>
        </td>
        <td>${task.createdAt}</td>
        <td>
          <div class="action-buttons">
            <button class="edit-btn" onclick="todoApp.openEditModal('${task.dateStr}', ${task.id})">Edit</button>
            <button class="delete-btn" onclick="todoApp.deleteTaskFromSummary('${task.dateStr}', ${task.id})">Delete</button>
          </div>
        </td>
      `;
      
      this.summaryTableBody.appendChild(row);
    });
    
    // Update pagination info
    const totalTasks = this.filteredTasks.length;
    const startItem = totalTasks === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, totalTasks);
    
    document.getElementById('pagination-info').textContent = 
      `Showing ${startItem}-${endItem} of ${totalTasks} tasks`;
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredTasks.length / this.pageSize);
    const paginationControls = document.getElementById('pagination-controls');
    
    paginationControls.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '← Previous';
    prevBtn.disabled = this.currentPage === 1;
    prevBtn.onclick = () => this.goToPage(this.currentPage - 1);
    paginationControls.appendChild(prevBtn);
    
    // Page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);
    
    if (startPage > 1) {
      const firstBtn = document.createElement('button');
      firstBtn.className = 'pagination-btn';
      firstBtn.textContent = '1';
      firstBtn.onclick = () => this.goToPage(1);
      paginationControls.appendChild(firstBtn);
      
      if (startPage > 2) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.padding = '8px';
        ellipsis.style.color = '#9ca3af';
        paginationControls.appendChild(ellipsis);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `pagination-btn ${i === this.currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.onclick = () => this.goToPage(i);
      paginationControls.appendChild(pageBtn);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.padding = '8px';
        ellipsis.style.color = '#9ca3af';
        paginationControls.appendChild(ellipsis);
      }
      
      const lastBtn = document.createElement('button');
      lastBtn.className = 'pagination-btn';
      lastBtn.textContent = totalPages;
      lastBtn.onclick = () => this.goToPage(totalPages);
      paginationControls.appendChild(lastBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = this.currentPage === totalPages;
    nextBtn.onclick = () => this.goToPage(this.currentPage + 1);
    paginationControls.appendChild(nextBtn);
  }

  goToPage(page) {
    this.currentPage = page;
    this.renderPaginatedTable();
    this.renderPagination();
  }

  changePageSize() {
    this.pageSize = parseInt(document.getElementById('page-size-select').value);
    this.currentPage = 1;
    this.renderPaginatedTable();
    this.renderPagination();
  }

  toggleTaskDetails(taskId) {
    const preview = document.getElementById(`preview-${taskId}`);
    const full = document.getElementById(`full-${taskId}`);
    const indicator = document.getElementById(`indicator-${taskId}`);
    const row = full ? full.closest('tr') : null;
    
    if (full && preview) {
      const isExpanded = full.classList.contains('expanded');
      
      if (isExpanded) {
        full.classList.remove('expanded');
        preview.style.display = 'block';
        indicator.textContent = 'Click to expand';
        if (row) row.classList.remove('expanded');
      } else {
        full.classList.add('expanded');
        preview.style.display = 'none';
        indicator.textContent = 'Click to collapse';
        if (row) row.classList.add('expanded');
      }
    }
  }

  async toggleTaskFromSummary(dateStr, taskId) {
    await this.toggleTask(dateStr, taskId);
  }

  // New modal-based edit functionality
  openEditModal(dateStr, taskId) {
    if (this.tasks[dateStr]) {
      const task = this.tasks[dateStr].find(task => task.id === taskId);
      if (task) {
        this.currentEditTask = { dateStr, taskId };
        this.editTitle.value = task.title;
        this.editDescription.value = task.body || '';
        this.editModal.classList.add('show');
        this.editTitle.focus();
      }
    }
  }

  closeEditModal() {
    this.editModal.classList.remove('show');
    this.currentEditTask = null;
    this.editTitle.value = '';
    this.editDescription.value = '';
  }

  async saveEditedTask() {
    if (!this.currentEditTask) return;
    
    const newTitle = this.editTitle.value.trim();
    if (!newTitle) return;
    
    const { dateStr, taskId } = this.currentEditTask;
    const task = this.tasks[dateStr].find(task => task.id === taskId);
    
    if (task) {
      task.title = newTitle;
      task.body = this.editDescription.value.trim();
      
      await this.saveDataToCSV();
      this.updateView();
      this.updateSummaryTable();
      this.closeEditModal();
    }
  }

  async deleteTaskFromSummary(dateStr, taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      await this.deleteTask(dateStr, taskId);
    }
  }

  exportData() {
    const dataStr = JSON.stringify(this.tasks, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'todo-tasks-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async importData(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedTasks = JSON.parse(e.target.result);
          // Merge with existing tasks
          Object.keys(importedTasks).forEach(dateStr => {
            if (!this.tasks[dateStr]) {
              this.tasks[dateStr] = [];
            }
            // Add unique ID to prevent conflicts
            importedTasks[dateStr].forEach(task => {
              task.id = Date.now() + Math.random();
            });
            this.tasks[dateStr] = [...this.tasks[dateStr], ...importedTasks[dateStr]];
          });
          await this.saveDataToCSV();
          this.updateView();
          this.updateSummaryTable();
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = ''; // Reset file input
  }

  async clearAllData() {
    if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
      this.tasks = {};
      await this.saveDataToCSV();
      this.updateView();
      this.updateSummaryTable();
    }
  }
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.getElementById(tabName + '-tab').classList.add('active');
  
  if (tabName === 'summary') {
    todoApp.updateSummaryTable();
  }
}

function exportData() {
  todoApp.exportData();
}

async function importData(event) {
  await todoApp.importData(event);
}

async function clearAllData() {
  await todoApp.clearAllData();
}

function updateSummaryTable() {
  todoApp.updateSummaryTable();
}

function changePageSize() {
  todoApp.changePageSize();
}

function closeEditModal() {
  todoApp.closeEditModal();
}

function saveEditedTask() {
  todoApp.saveEditedTask();
}

// Initialize the app
const todoApp = new TodoApp();