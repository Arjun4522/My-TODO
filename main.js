const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Create test directory if it doesn't exist
const testDir = path.join(__dirname, 'test');
const csvFilePath = path.join(testDir, 'tasks.csv');

function ensureTestDirectory() {
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  win.loadFile('index.html');

  // Handle window close event
  win.on('close', (event) => {
    // Get tasks data from renderer and save
    win.webContents.send('request-save-data');
  });

  return win;
}

// IPC handlers for saving/loading CSV data
ipcMain.handle('save-tasks-csv', async (event, tasksData) => {
  try {
    ensureTestDirectory();
    
    // Convert tasks object to CSV format
    const csvRows = ['Date,Title,Description,Completed,CreatedAt'];
    
    Object.keys(tasksData).forEach(dateStr => {
      const tasks = tasksData[dateStr];
      tasks.forEach(task => {
        const row = [
          dateStr,
          `"${(task.title || '').replace(/"/g, '""')}"`,
          `"${(task.body || '').replace(/"/g, '""')}"`,
          task.completed ? 'true' : 'false',
          `"${task.createdAt || ''}"`
        ].join(',');
        csvRows.push(row);
      });
    });
    
    const csvContent = csvRows.join('\n');
    fs.writeFileSync(csvFilePath, csvContent, 'utf8');
    
    console.log('Tasks saved to CSV successfully');
    return { success: true };
  } catch (error) {
    console.error('Error saving tasks to CSV:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-tasks-csv', async () => {
  try {
    ensureTestDirectory();
    
    if (!fs.existsSync(csvFilePath)) {
      console.log('No existing CSV file found, starting with empty tasks');
      return { success: true, data: {} };
    }
    
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvContent.split('\n');
    
    if (lines.length <= 1) {
      return { success: true, data: {} };
    }
    
    const tasks = {};
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV row (handle quoted fields)
      const csvParts = [];
      let currentPart = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          if (inQuotes && line[j + 1] === '"') {
            currentPart += '"';
            j++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          csvParts.push(currentPart);
          currentPart = '';
        } else {
          currentPart += char;
        }
      }
      csvParts.push(currentPart); // Add last part
      
      if (csvParts.length >= 5) {
        const [dateStr, title, description, completed, createdAt] = csvParts;
        
        if (!tasks[dateStr]) {
          tasks[dateStr] = [];
        }
        
        tasks[dateStr].push({
          id: Date.now() + Math.random(), // Generate new ID
          title: title,
          body: description,
          completed: completed === 'true',
          createdAt: createdAt
        });
      }
    }
    
    console.log('Tasks loaded from CSV successfully');
    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error loading tasks from CSV:', error);
    return { success: false, error: error.message, data: {} };
  }
});

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Save data when app is about to quit
app.on('before-quit', async (event) => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    event.preventDefault();
    
    // Request save from all windows
    windows.forEach(win => {
      win.webContents.send('request-final-save');
    });
    
    // Give some time for save operations to complete
    setTimeout(() => {
      app.exit();
    }, 1000);
  }
});