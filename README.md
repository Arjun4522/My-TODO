# 📅 Calendar To-Do App

A modern, cross-platform task management application built with Electron. Organize tasks by date with an intuitive interface, featuring a daily view, task summaries, and editing capabilities.

## ✨ Features

- **📆 Date-Based Task Management**: Assign tasks to specific dates with titles and optional descriptions
- **📋 Daily View**: View and manage tasks for a selected date with a side-by-side form and task list layout
- **📊 All Tasks Summary**: Filterable and paginated table of all tasks across dates with export/import functionality
- **✏️ Task Editing**: Edit tasks in a dedicated modal with options to save or discard changes
- **💾 Data Persistence**: Store tasks in CSV (Electron) or localStorage (browser) with auto-save functionality
- **🖌️ Professional UI**: Clean, professional color scheme with responsive design for desktop and mobile
- **⚡ Cross-Platform**: Runs on Windows, macOS, and Linux via Electron, with Wine support for building Windows executables on Linux
- **🧪 Reproducible Development**: Nix Flakes ensure a consistent development environment

## 🛠️ Prerequisites

- **Node.js** (v16 or higher) for browser-based development or running Electron
- **NixOS** with Nix Flakes enabled for reproducible builds
- **direnv** (optional, recommended for automatic environment setup)
- **Wine** (for building and testing Windows executables on Linux)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/arjunscript/calendar-todo-app.git
cd calendar-todo-app
```

### 2. Set Up the Development Environment

#### Using Nix Flakes (Recommended)

```bash
nix develop
```

This sets up a reproducible environment with Electron, Node.js, and Wine.

#### Using Node.js Directly

```bash
npm install
```

Installs dependencies listed in `package.json`.

### 3. Run the App

#### On NixOS/Linux

```bash
electron . --no-sandbox --disable-gpu --enable-logging
```

> **Note**: Use `--no-sandbox` due to NixOS security restrictions and `--disable-gpu` to avoid GPU driver issues.

#### In Browser (Development)

Open `index.html` in a modern browser to test without Electron. Note that CSV storage requires Electron.

### 4. Build the Windows Executable

#### Configure Wine for 64-bit

```bash
WINEARCH=win64 WINEPREFIX=~/.wine64 winecfg
```

#### Build

```bash
WINEPREFIX=~/.wine64 npm run build-win
```

The executable will be in `dist/calendar-todo-app-win32-x64/`.

#### Run with Wine

```bash
WINEPREFIX=~/.wine64 wine64 ./dist/calendar-todo-app-win32-x64/calendar-todo-app.exe
```

## 📦 Releasing

To create a release:

1. Build the Windows executable as above
2. Zip the output directory:
   ```bash
   zip -r calendar-todo-app-win32-x64.zip dist/calendar-todo-app-win32-x64
   ```
3. Upload to GitHub Releases (max 2 GB per file)

## 📁 Project Structure

```
calendar-todo-app/
├── dist/                    # Build output directory
├── index.html              # Main HTML file
├── main.js                 # Electron main process
├── preload.js              # Preload script for secure IPC
├── script.js               # Renderer logic (TodoApp class)
├── styles.css              # Styles with professional color scheme
├── package.json            # NPM configuration and scripts
├── flake.nix               # Nix Flake for reproducible environment
└── calendar_to_do_qt.cpp   # Legacy Qt version (not actively maintained)
```

## 🖼️ Screenshots

![Daily View](screenshots/daily-view.png)
*Side-by-side task input and task list in Daily View tab*

![Summary View](screenshots/summary-view.png)
*All Tasks Summary with filtering and pagination*

## 📱 Usage

### Daily View
- Select a date using the calendar input
- Add tasks with titles and optional descriptions
- Check off completed tasks
- Edit or delete existing tasks
- View statistics for the selected date

### Summary View
- View all tasks across all dates in a paginated table
- Filter tasks by status (All, Completed, Pending)
- Search tasks by title or description
- Export/import task data as JSON
- Edit or delete tasks directly from the summary

### Data Management
- **Auto-save**: Tasks are automatically saved when modified
- **Export**: Download all tasks as a JSON file
- **Import**: Upload and restore tasks from a JSON file
- **Clear All**: Remove all tasks with confirmation

## 📝 Notes

- **Wine Configuration**: Ensure a 64-bit Wine prefix for Windows builds
- **Browser Limitations**: CSV storage is Electron-only; browsers use localStorage
- **Responsive Design**: The UI adapts to mobile screens, with the daily view stacking vertically below 768px
- **Accessibility**: Includes focus management and keyboard navigation support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m "Add YourFeature"`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and structure
- Test on multiple platforms when possible
- Update documentation for new features
- Ensure responsive design principles are maintained

## 🐛 Bug Reports & Feature Requests

Use the [GitHub Issues](https://github.com/arjunscript/calendar-todo-app/issues) page to report bugs or suggest features.

### When Reporting Issues

- Include your operating system and version
- Describe steps to reproduce the issue
- Include screenshots if applicable
- Mention if you're using Electron or browser version

## 🏗️ Architecture

### Electron Components
- **Main Process** (`main.js`): Window management and file system operations
- **Preload Script** (`preload.js`): Secure IPC bridge between main and renderer
- **Renderer Process** (`index.html`, `script.js`): UI and application logic

### Data Storage
- **Electron**: CSV files for persistent storage
- **Browser**: localStorage for development and testing

### Security
- Context isolation enabled
- Node integration disabled in renderer
- Secure IPC communication via preload script

## 🔧 Development Tips

### Running in Different Environments

```bash
# Development in browser
open index.html

# Electron development
npm start

# Build for production
npm run build-win    # Windows
npm run build-mac    # macOS  
npm run build-linux  # Linux
```

### Debugging

```bash
# Enable verbose logging
electron . --enable-logging --log-level=0

# Open developer tools
# Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (macOS)
```

## 📄 License

MIT © 2025 Arjun Ghoshal

---

**Made with ❤️ for productivity enthusiasts**
