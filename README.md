Calendar To-Do App
This is a simple Calendar To-Do application built with Electron, allowing you to manage tasks associated with specific dates.
Prerequisites

NixOS with Nix Flakes enabled

Setting up the Development Environment

Enter the Nix development shell:
nix develop

This sets up the environment with necessary dependencies like Node.js, Electron, and Wine.

Install project dependencies:
npm install

This installs dependencies from package.json using the system Electron provided by Nix.


Running the App on NixOS

Start the Electron app:electron . --no-sandbox --disable-gpu --enable-logging

The flags --no-sandbox and --disable-gpu are required due to NixOS's security restrictions and potential GPU issues.

Building and Running the Windows Executable

Configure Wine for 64-bit Windows applications:
WINEARCH=win64 WINEPREFIX=~/.wine64 winecfg


Build the Windows executable:
WINEPREFIX=~/.wine64 npm run build-win

This creates a Windows executable in dist/calendar-todo-app-win32-x64/.

Run the Windows executable using Wine:
WINEPREFIX=~/.wine64 wine64 ./dist/calendar-todo-app-win32-x64/calendar-todo-app.exe



Notes

The --no-sandbox and --disable-gpu flags are necessary when running Electron directly on NixOS.
Wine is used to build and run the Windows executable on NixOS.
Ensure your Wine prefix is configured for 64-bit applications.
