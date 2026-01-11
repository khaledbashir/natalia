# Git Setup for ANC CPQ Project

## Initial Setup

```bash
# Navigate to project root
cd /root/natalia

# Initialize Git repository
git init

# Create main branch
git branch -M main

# Add all existing files
git add .

# Make initial commit
git commit -m "Initial commit: ANC CPQ demo with conversational interface and basic calculator"
```

## Feature Branch Creation

```bash
# Create feature branch for ANC proposal enhancements
git checkout -b feature/anc-proposal-enhancement

# Verify you're on the correct branch
git branch
```

## Workflow

### Before Starting Work
```bash
# Ensure you're on the feature branch
git checkout feature/anc-proposal-enhancement

# Pull any updates (if working with team)
git pull origin feature/anc-proposal-enhancement
```

### During Development
```bash
# Check current status
git status

# Add specific files
git add path/to/file

# Or add all modified files
git add .

# Commit changes with descriptive messages
git commit -m "feat: add question-based configuration wizard"

# Push to remote (if using GitHub/GitLab)
git push -u origin feature/anc-proposal-enhancement
```

### Commit Message Convention
Use conventional commits for clear history:

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```bash
git commit -m "feat: add ANC product catalog with real pricing"
git commit -m "fix: resolve margin calculation in PM cost"
git commit -m "refactor: improve calculator modularity"
```

## Phase-Based Commits

Suggested commit structure for implementation phases:

### Phase 1: Critical Demo Enhancements
```bash
git commit -m "feat: implement question-based configuration wizard"
git commit -m "feat: add complete 12-category cost calculator"
git commit -m "feat: add real ANC products catalog from website"
git commit -m "feat: enhance PDF generator with ANC branding"
```

### Phase 2: Presentation Enhancements
```bash
git commit -m "feat: add industry templates (NFL, NBA, NCAA, Transit)"
git commit -m "feat: implement demo presets for one-click scenarios"
git commit -m "feat: add real-time cost breakdown with visual indicators"
```

### Phase 3: Polish & Optimization
```bash
git commit -m "feat: add loading animations and success indicators"
git commit -m "feat: improve data validation and error handling"
git commit -m "perf: optimize PDF generation and caching"
```

## Merging to Main (After Demo Success)

```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge feature branch
git merge feature/anc-proposal-enhancement --no-ff

# Push to main
git push origin main

# Tag the release
git tag -a v2.0.0 -m "ANC Proposal System - Phase 1 Complete"
git push origin v2.0.0
```

## Demo Backup Strategy

Before Wednesday demo:

```bash
# Create backup branch
git checkout -b backup/wednesday-demo-v1

# Commit current state
git add .
git commit -m "backup: working demo for Wednesday presentation"

# Push backup
git push -u origin backup/wednesday-demo-v1

# Return to feature branch
git checkout feature/anc-proposal-enhancement
```

## Emergency Rollback

If something breaks before demo:

```bash
# List recent commits
git log --oneline -10

# Reset to specific commit
git reset --hard <commit-hash>

# Or reset to backup branch
git reset --hard backup/wednesday-demo-v1

# Push reset (force push - use with caution)
git push -f origin feature/anc-proposal-enhancement
```

## .gitignore Recommendations

Add to `.gitignore`:

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/

# Node
node_modules/
npm-debug.log
yarn-error.log
.pnpm-debug.log
.next/
out/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Generated files
*.pdf
*.xlsx
output_*.json
```

## Useful Aliases

Add to `~/.gitconfig`:

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD
    last = log -1 HEAD
    visual = log --graph --oneline --all --decorate
```

## Quick Reference

```bash
# Check what branch you're on
git branch --show-current

# See what files changed
git diff

# See commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Stash changes temporarily
git stash save "work in progress"

# Apply stashed changes
git stash pop
```

## Project-Specific Notes

- **Never commit** ANC's proprietary pricing formulas to public repo
- **Never commit** real client data (use anonymized demo data)
- **Commit often** - small, focused commits are easier to debug
- **Test before committing** - ensure demo still works
- **Backup before major changes** - create backup branches before risky work

## Contact

For questions about this Git setup or workflow, contact:
- Ahmad Basheer (Project Lead)