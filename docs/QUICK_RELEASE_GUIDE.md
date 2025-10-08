# 🚀 Quick Start: Creating a Release

## Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Go to GitHub Actions                               │
│  ──────────────────────────────────────────────────────────│
│  Repository → Actions tab → "🚀 Manual Release"            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Click "Run workflow"                               │
│  ──────────────────────────────────────────────────────────│
│  [Run workflow ▼]  (button on the right)                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Fill in the form                                   │
│  ──────────────────────────────────────────────────────────│
│  🎯 Release Type: [staging ▼] or [production ▼]           │
│  📦 Version: [1.0.0____________]                           │
│  📝 Notes: [Bug fixes and improvements...]                 │
│                                                             │
│  [Run workflow]                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Wait ~15-20 minutes                                │
│  ──────────────────────────────────────────────────────────│
│  ✓ Setup environment                                        │
│  ✓ Install dependencies                                     │
│  ✓ Build Android APK                                        │
│  ✓ Create GitHub release                                    │
│  ✓ Upload APK file                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Find your release                                  │
│  ──────────────────────────────────────────────────────────│
│  Repository → Releases → Download APK                       │
└─────────────────────────────────────────────────────────────┘
```

## Two Release Types

### 🧪 Staging Release
```
Use for: Testing, QA, Beta
Tag: v1.0.0-staging
Badge: Pre-release 🏷️
Perfect for: Internal testing before going live
```

### 🎉 Production Release
```
Use for: Public release
Tag: v1.0.0-production
Badge: Latest Release ✨
Perfect for: End users, app stores
```

## Example Workflow

```bash
# Week 1: Development
git commit -m "Add new feature"
git push

# Week 2: Testing
→ Create staging release (v1.0.0-staging)
→ QA team tests
→ Find bugs, fix them

# Week 3: Production
→ Create production release (v1.0.0-production)
→ Users download and install
→ Success! 🎉

# Week 4: Hotfix
→ Fix critical bug
→ Create production release (v1.0.1-production)
```

## Version Number Tips

```
1.0.0 → First release
 │ │ │
 │ │ └─ PATCH: Bug fixes (1.0.1)
 │ └─── MINOR: New features (1.1.0)
 └───── MAJOR: Big changes (2.0.0)
```

## What You Get

Each release includes:

```
📦 Release Package
├── 📱 app-release.apk (your Android app)
├── 📋 Release description
│   ├── Version info
│   ├── Release notes
│   ├── Commit details
│   └── Installation guide
└── 🏷️ Git tag (for version tracking)
```

## Need Help?

```
📚 Full Documentation: docs/manual-release-guide.md
🐛 Issues? Check GitHub Actions logs
💬 Questions? Ask the team
```
