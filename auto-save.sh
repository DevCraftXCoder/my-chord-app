#!/bin/bash
# Auto-save script for Chord App (Linux/Mac/WSL)
# This script automatically commits and pushes changes to GitHub

cd "$(dirname "$0")"

echo "[Auto-Save] Checking for changes..."

# Check if there are any changes
if git diff-index --quiet HEAD --; then
    echo "[Auto-Save] No changes to save."
    exit 0
fi

echo "[Auto-Save] Changes detected. Committing..."

# Add all changes
git add .

# Create commit with timestamp
timestamp=$(date "+%Y-%m-%d %H:%M:%S")
git commit -m "Auto-save: $timestamp"

if [ $? -eq 0 ]; then
    echo "[Auto-Save] Pushing to GitHub..."
    git push origin main

    if [ $? -eq 0 ]; then
        echo "[Auto-Save] ✓ Successfully saved to GitHub!"
    else
        echo "[Auto-Save] ✗ Failed to push to GitHub."
        echo "[Auto-Save] Changes are committed locally. Push manually when online."
    fi
else
    echo "[Auto-Save] ✗ Commit failed."
fi
