# AREA Mobile - Quick Start

Get started with AREA Mobile in 5 minutes!

---

## Prerequisites

- Node.js 18+
- Yarn
- Android Studio OR Xcode

---

## Install & Run

```bash
# Clone
git clone https://github.com/SamTess/AREA_Mobile.git
cd AREA_Mobile

# Install
yarn install

# Start
yarn start
```

Press:
- `a` for Android
- `i` for iOS  
- `w` for Web

---

## Test Account

```
Email: user@example.com
Password: password123
```

---

## Run Tests

```bash
yarn test           # All tests
yarn test:watch     # Watch mode
yarn coverage       # With coverage
```

Expected: ✅ 26 suites, 169 tests passing

---

## Common Issues

**Metro won't start:**
```bash
yarn start --clear
```

**Cache errors:**
```bash
rm -rf node_modules && yarn install
```

---

## Quick Commands

```bash
yarn start    # Start Expo
yarn android  # Android
yarn ios      # iOS
yarn test     # Tests
yarn lint     # Linting
```

---

## Project Structure

```
app/         # Pages (Expo Router)
components/  # UI components
contexts/    # State (Auth)
services/    # API logic
locales/     # Translations (FR/EN)
```

---

Need help? Check [TECHNICAL.md](TECHNICAL.md) or [create an issue](https://github.com/SamTess/AREA_Mobile/issues).
