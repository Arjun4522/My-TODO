{
  description = "Electron Calendar To-Do App";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in {
        devShells.default = pkgs.mkShell {
          name = "electron-dev-shell";
          buildInputs = [
            pkgs.nodejs_20
            pkgs.electron
            pkgs.git
            pkgs.nodePackages.npm
          ];
          shellHook = ''
            echo "✔ Electron Dev Shell Ready"
            echo "ℹ Using system Electron to avoid NixOS compatibility issues"
            echo "ℹ Electron version: $(electron --version)"
            
            # Set up environment
            export ELECTRON_MIRROR="https://github.com/electron/electron/releases/download/"
            export PATH="$PATH:./node_modules/.bin"
            export ELECTRON_EXTRA_ARGS="--no-sandbox --disable-gpu-sandbox"
            
            # Prevent npm from trying to install electron
            export ELECTRON_SKIP_BINARY_DOWNLOAD=1
            
            # Create symbolic link to system electron if node_modules exists
            if [ -d "node_modules" ] && [ ! -L "node_modules/.bin/electron" ]; then
              mkdir -p node_modules/.bin
              ln -sf $(which electron) node_modules/.bin/electron
            fi
          '';
        };
        
        # Optional: Create a package for your app
        packages.default = pkgs.stdenv.mkDerivation {
          pname = "calendar-todo-app";
          version = "1.0.0";
          
          src = ./.;
          
          buildInputs = [ pkgs.electron ];
          
          installPhase = ''
            mkdir -p $out/bin $out/share/calendar-todo-app
            cp -r . $out/share/calendar-todo-app/
            
            cat > $out/bin/calendar-todo-app <<EOF
            #!/usr/bin/env bash
            cd $out/share/calendar-todo-app
            exec ${pkgs.electron}/bin/electron . --no-sandbox --disable-gpu "\$@"
            EOF
            chmod +x $out/bin/calendar-todo-app
          '';
        };
      });
}