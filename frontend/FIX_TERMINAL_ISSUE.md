# Fix Terminal "uv_cwd" Error

## Problem
You're getting: `Error: ENOENT: no such file or directory, uv_cwd`

This happens when your terminal's current working directory is invalid or was deleted.

## Solution

### Option 1: Navigate to directory again (Recommended)
```bash
cd /home/tensae/Desktop/projects/stadipass/frontend
npm run dev
```

### Option 2: Open a new terminal
1. Close current terminal
2. Open new terminal
3. Run:
```bash
cd /home/tensae/Desktop/projects/stadipass/frontend
npm run dev
```

### Option 3: Verify directory exists first
```bash
ls -la /home/tensae/Desktop/projects/stadipass/frontend
cd /home/tensae/Desktop/projects/stadipass/frontend
npm run dev
```

## Quick Test Script
Save this as `start-dev.sh` in the frontend directory:
```bash
#!/bin/bash
cd /home/tensae/Desktop/projects/stadipass/frontend
npm run dev
```

Then run:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

## Note
The dev server is already running in the background on port 5173. You can access it at:
- http://localhost:5173

If you want to stop it and restart:
```bash
# Find and kill the process
pkill -f "vite"

# Then start fresh
cd /home/tensae/Desktop/projects/stadipass/frontend
npm run dev
```

