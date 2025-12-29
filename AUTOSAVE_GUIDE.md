# Auto-Save to GitHub Guide

This guide shows you how to automatically save your Chord App changes to GitHub.

---

## Quick Start

### Option 1: Manual Auto-Save (Easiest)

**Windows**:
```bash
# Run this anytime to save your work:
auto-save.bat
```

**Linux/Mac/WSL**:
```bash
# Make executable (first time only):
chmod +x auto-save.sh

# Run to save your work:
./auto-save.sh
```

---

## Option 2: VS Code Auto-Save (Recommended)

### Step 1: Enable Auto-Save in VS Code

1. Open VS Code
2. Go to **File → Auto Save** (or press `Ctrl+Shift+P` and type "Auto Save")
3. Check the menu item to enable it

### Step 2: Install Git Extension

VS Code has built-in Git support! Here's how to use it:

1. Click the **Source Control** icon in the left sidebar (or press `Ctrl+Shift+G`)
2. You'll see all your changes listed
3. Enter a commit message (e.g., "Updated chord progressions")
4. Click the **✓** (checkmark) to commit
5. Click **"..."** → **Push** to upload to GitHub

**Even Easier**: Enable **Auto Fetch** and **Auto Push**:
1. Go to **File → Preferences → Settings** (or `Ctrl+,`)
2. Search for "git autofetch"
3. Enable **Git: Autofetch**
4. Search for "git postCommitCommand"
5. Set to **"push"**

Now when you commit, it automatically pushes!

---

## Option 3: Scheduled Auto-Save (Advanced)

### Windows Task Scheduler

1. Open **Task Scheduler** (search in Start Menu)
2. Click **"Create Basic Task"**
3. Name: "Chord App Auto-Save"
4. Trigger: **"Daily"** or **"When I log on"**
5. Action: **"Start a program"**
6. Program: `C:\Users\J\Documents\Chord App\auto-save.bat`
7. Click **Finish**

**Auto-save every 30 minutes**:
- In Triggers, click **Edit**
- Check **"Repeat task every"** → Select **30 minutes**
- Duration: **Indefinitely**

### Linux/Mac Cron Job

```bash
# Open crontab
crontab -e

# Add this line to auto-save every 30 minutes:
*/30 * * * * /Users/J/Documents/Chord\ App/auto-save.sh

# Save and exit
```

---

## Option 4: Real-Time Auto-Save (Most Advanced)

### Using Git Watch (Windows)

Install **Git Auto-Sync** tools:

```bash
# Install npm (if not installed)
# Download from: https://nodejs.org/

# Install git-watch globally
npm install -g git-watch
```

Then in your project folder:
```bash
git-watch
```

This watches for file changes and auto-commits!

### Using fswatch (Mac/Linux)

```bash
# Mac
brew install fswatch

# Ubuntu/Debian
sudo apt-get install inotify-tools

# Run auto-save on file changes
fswatch -o . | xargs -n1 -I{} ./auto-save.sh
```

---

## What Gets Auto-Saved?

The auto-save script saves:
- ✅ All code changes (`.py`, `.js`, `.html`, `.css`)
- ✅ Documentation files (`.md`)
- ✅ Configuration files (`docker-compose.yml`, etc.)

**Not saved** (excluded by `.gitignore`):
- ❌ `__pycache__/` folders
- ❌ `.venv/` virtual environments
- ❌ `.env` files (may contain secrets)
- ❌ Log files
- ❌ Temporary files

---

## Verify Auto-Save is Working

1. Make a small change (e.g., add a comment)
2. Run `auto-save.bat` (Windows) or `./auto-save.sh` (Linux/Mac)
3. Check GitHub: https://github.com/DevCraftXCoder/my-chord-app
4. You should see your commit!

---

## Troubleshooting

### "Permission Denied" (Linux/Mac)
```bash
chmod +x auto-save.sh
```

### "Not a git repository"
```bash
cd "c:\Users\J\Documents\Chord App"
git status
```

### "Failed to push"
- Check internet connection
- Verify GitHub credentials
- Changes are saved locally, push manually later:
  ```bash
  git push origin main
  ```

### "Nothing to commit"
- No changes were made
- Or files are in `.gitignore` (check `.gitignore` file)

---

## Best Practices

### ✅ Do:
- Commit small, logical changes
- Use descriptive commit messages
- Auto-save every 15-30 minutes
- Test your code before auto-saving

### ❌ Don't:
- Auto-save every second (creates too many commits)
- Save sensitive data (API keys, passwords)
- Commit broken code
- Save large binary files

---

## Alternative: GitHub Desktop (GUI)

If you prefer a visual interface:

1. Download **GitHub Desktop**: https://desktop.github.com/
2. Sign in with GitHub account
3. Add your repository: **File → Add Local Repository**
4. Browse to: `C:\Users\J\Documents\Chord App`
5. Click **"Add"**

Now you can:
- See changes visually
- Commit with one click
- Push with one click
- View history graphically

---

## Manual Save Commands

### Quick Save (Windows PowerShell or Git Bash):
```bash
cd "c:\Users\J\Documents\Chord App"
git add .
git commit -m "Save progress"
git push origin main
```

### One-Line Save:
```bash
git add . && git commit -m "Auto-save $(date)" && git push origin main
```

---

## Current Setup

Your repository is already configured:
- **Repository**: https://github.com/DevCraftXCoder/my-chord-app
- **Branch**: main
- **Remote**: origin
- **Last Commit**: "Add critical security fixes and comprehensive documentation"

---

## Scripts Included

| File | Description | Platform |
|------|-------------|----------|
| `auto-save.bat` | Auto-save script | Windows |
| `auto-save.sh` | Auto-save script | Linux/Mac/WSL |
| `.gitignore` | Files to exclude | All |

---

## Quick Reference

### Check Status:
```bash
git status
```

### View Recent Commits:
```bash
git log --oneline -5
```

### Force Sync (if behind):
```bash
git pull origin main
```

### Undo Last Commit (keep changes):
```bash
git reset --soft HEAD~1
```

---

## Support

If auto-save isn't working:
1. Check internet connection
2. Verify git credentials: `git config --list`
3. Test manually: `git push origin main`
4. Check GitHub repository online

---

**Happy Coding!** Your changes will now auto-save to GitHub! 🚀
