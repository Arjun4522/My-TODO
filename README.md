📅 Calendar To-Do App
A modern, cross-platform task management application built with Electron. Organize tasks by date with an intuitive interface, featuring a daily view, task summaries, and editing capabilities.

 
✨ Features

📆 Date-Based Task Management: Assign tasks to specific dates with titles and optional descriptions.
📋 Daily View: View and manage tasks for a selected date with a side-by-side form and task list layout.
📊 All Tasks Summary: Filterable and paginated table of all tasks across dates with export/import functionality.
✏️ Task Editing: Edit tasks in a dedicated tab with options to save or discard changes.
💾 Data Persistence: Store tasks in CSV (Electron) or localStorage (browser) with auto-save every 30 seconds.
🖌️ Professional UI: Clean, professional color scheme with responsive design for desktop and mobile.
⚡ Cross-Platform: Runs on Windows, macOS, and Linux via Electron, with Wine support for building Windows executables on Linux.
🧪 Reproducible Development: Nix Flakes ensure a consistent development environment.

🛠️ Prerequisites

Node.js (v16 or higher) for browser-based development or running Electron.
NixOS with Nix Flakes enabled for reproducible builds.
direnv (optional, recommended for automatic environment setup).
Wine (for building and testing Windows executables on Linux).

🚀 Getting Started
1. Clone the Repository
git clone https://github.com/arjunscript/calendar-todo-app.git
cd calendar-todo-app

2. Set Up the Development Environment
Using Nix Flakes (Recommended)
nix develop

This sets up a reproducible environment with Electron, Node.js, and Wine.
Using Node.js Directly
npm install

Installs dependencies listed in package.json.
3. Run the App
On NixOS/Linux
electron . --no-sandbox --disable-gpu --enable-logging


Note: Use --no-sandbox due to NixOS security restrictions and --disable-gpu to avoid GPU driver issues.

In Browser (Development)
Open index.html in a modern browser to test without Electron. Note that CSV storage requires Electron.
4. Build the Windows Executable
Configure Wine for 64-bit
WINEARCH=win64 WINEPREFIX=~/.wine64 winecfg

Build
WINEPREFIX=~/.wine64 npm run build-win

The executable will be in dist/calendar-todo-app-win32-x64/.
Run with Wine
WINEPREFIX=~/.wine64 wine64 ./dist/calendar-todo-app-win32-x64/calendar-todo-app.exe

📦 Releasing
To create a release:

Build the Windows executable as above.
Zip the output directory:

zip -r calendar-todo-app-win32-x64.zip dist/calendar-todo-app-win32-x64


Upload to GitHub Releases (max 2 GB per file).

📁 Project Structure
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

🖼️ Screenshots
 Side-by-side task input and task list in Daily View tab
📝 Notes

Wine Configuration: Ensure a 64-bit Wine prefix for Windows builds.
Browser Limitations: CSV storage is Electron-only; browsers use localStorage.
Responsive Design: The UI adapts to mobile screens, with the daily view stacking vertically below 768px.
Accessibility: Includes focus management and skip links for keyboard navigation.

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a feature branch (git checkout -b feature/YourFeature).
Commit changes (git commit -m "Add YourFeature").
Push to the branch (git push origin feature/YourFeature).
Open a Pull Request.

🐛 Bug Reports & Feature Requests
Use the GitHub Issues page to report bugs or suggest features.
📜 License
MIT © 2025 Arjun Ghoshal
