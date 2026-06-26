# Store Deployment Plan

Goal: Publish Spell Caster TCG on Steam, Google Play, and Apple App Store.

Current stack: Vanilla JS/HTML/CSS, no bundler, no framework, browser-only.

---

## 1. Steam (Windows / Mac / Linux)

### Phase 1 — Build system (Vite)

| Step | Detail |
|------|--------|
| 1.1 | `npm init -y` + `npm install vite --save-dev` |
| 1.2 | Create `vite.config.js` with `base: './'` |
| 1.3 | Convert 40+ `<script>` global-scope files to ES modules (`import`/`export`) |
| 1.4 | Replace script tags with `<script type="module" src="/app.js">` |
| 1.5 | Fix template loader (`fetch()` on `.html` files) to work with Vite |
| 1.6 | `npm run build` → single optimized bundle in `dist/` |

**Risk:** Global scope coupling (`window.X = X` pattern everywhere). Circular dependencies may surface during module conversion.

### Phase 2 — Electron wrapper

| Step | Detail |
|------|--------|
| 2.1 | `npm install electron --save-dev` |
| 2.2 | Create `electron/main.js` — `BrowserWindow` 1280x720, load `dist/index.html` |
| 2.3 | Create `electron/preload.js` — secure bridge for localStorage |
| 2.4 | Test: Vite build + Electron loads the built output |

**Already works:** localStorage, Web Audio API, fetch() for data files (via `file://`).

### Phase 3 — Packaging (electron-builder)

| Step | Detail |
|------|--------|
| 3.1 | `npm install electron-builder --save-dev` |
| 3.2 | Configure `package.json` — targets: Windows (NSIS), macOS (DMG), Linux (AppImage) |
| 3.3 | Scripts: `build:win`, `build:mac`, `build:linux` |
| 3.4 | Generate installers |

### Phase 4 — Steamworks SDK

| Step | Detail |
|------|--------|
| 4.1 | Register Steamworks Partner account ($100) |
| 4.2 | `npm install steamworks.js` — Node native binding |
| 4.3 | Expose Steamworks API via preload script |
| 4.4 | Connect `AchievementManager` to `Steamworks.setAchievement()` |
| 4.5 | Connect `PlayerProgressionManager` saves to Steam Cloud |
| 4.6 | Add Steam DRM (`steam_api.dll`) |
| 4.7 | Enable Steam overlay in `BrowserWindow` |

### Phase 5 — Store release

| Step | Detail |
|------|--------|
| 5.1 | Capsule art (header, small, main, hero) |
| 5.2 | 1280x720 screenshots |
| 5.3 | Trailer video (recommended) |
| 5.4 | Store page: description, tags, pricing, sys reqs |
| 5.5 | Final signed build → SteamPipe upload |

**Estimated time:** ~6-8 weeks (1 dev)

---

## 2. Google Play (Android)

### Prerequisites

- Google Play Developer account ($25, one-time)
- Java/Android SDK (or Android Studio)

### Phase 1 — Mobile wrapper (Capacitor)

| Step | Detail |
|------|--------|
| 1.1 | `npm install @capacitor/core @capacitor/cli --save-dev` |
| 1.2 | `npx cap init SpellCaster com.spellcaster.tcg` |
| 1.3 | `npx cap add android` — generates `android/` project |
| 1.4 | Configure `capacitor.config.json` — orientation, splash, appId |
| 1.5 | `npx cap sync` — copies web build to Android assets |

### Phase 2 — Vite build for mobile

| Step | Detail |
|------|--------|
| 2.1 | Ensure Vite outputs to `dist/` with relative paths |
| 2.2 | Point Capacitor's `webDir` to `dist/` |
| 2.3 | `npm run build` then `npx cap copy` |

### Phase 3 — Android adjustments

| Step | Detail |
|------|--------|
| 3.1 | Test touch events — game uses `click` events everywhere |
| 3.2 | Adapt layout for notch/cutout and varied aspect ratios |
| 3.3 | Test localStorage persistence in WebView |
| 3.4 | Configure `AndroidManifest.xml` — fullscreen, orientation lock |

### Phase 4 — Build & release

| Step | Detail |
|------|--------|
| 4.1 | Generate signed AAB (Android App Bundle) |
| 4.2 | Internal test track → closed alpha → open beta |
| 4.3 | Store listing: icon, screenshots (phone + tablet), description |
| 4.4 | Privacy policy URL (required) |
| 4.5 | Production release |

**Estimated time:** ~4-6 weeks (1 dev)

---

## 3. Apple App Store (iOS)

### Prerequisites

- Apple Developer account ($99/year)
- macOS with Xcode

### Phase 1 — Capacitor iOS

| Step | Detail |
|------|--------|
| 1.1 | `npx cap add ios` — generates `ios/` Xcode project |
| 1.2 | `npx cap sync` — copies web build |

### Phase 2 — iOS adjustments

| Step | Detail |
|------|--------|
| 2.1 | WKWebView: `fetch()` and `localStorage` work natively |
| 2.2 | Web Audio API: requires user gesture to start audio context |
| 2.3 | Safe area / notch handling — test on iPhone SE → Pro Max |
| 2.4 | Disable text selection, callout, 3D touch menus in WebView |
| 2.5 | Enable In-App Purchase capability (if monetized) |

### Phase 3 — Xcode project

| Step | Detail |
|------|--------|
| 3.1 | Set Bundle ID, version, build number |
| 3.2 | Configure signing (certificate + provisioning profile) |
| 3.3 | Set deployment target (iOS 15.0+) |
| 3.4 | Splash screen / LaunchScreen storyboard |

### Phase 4 — App Store Connect

| Step | Detail |
|------|--------|
| 4.1 | Create app listing — name, subtitle, keywords |
| 4.2 | Screenshots: 6.5" + 5.5" + iPad sizes required |
| 4.3 | App preview video (30s, optional) |
| 4.4 | Privacy policy URL (required) |
| 4.5 | Submit for review (~24-48h typical) |

**Estimated time:** ~4-6 weeks (1 dev, macOS required)

---

## Common prerequisites (all platforms)

| Item | Why |
|------|-----|
| **Vite bundler** | Required before any platform — replaces 40+ global `<script>` tags |
| **Error tracking** | Sentry or Firebase Crashlytics for post-launch monitoring |
| **Analytics** | Firebase Analytics or Steamworks stats |
| **Privacy policy** | Required by Google Play and App Store |

## Effort summary

| Platform | Time (1 dev) |
|----------|-------------|
| Steam | 6-8 weeks |
| Google Play | 4-6 weeks |
| Apple App Store | 4-6 weeks |
| **Total (sequential)** | **~4-5 months** |

Can be optimized by parallelizing store assets + Steamworks prep while waiting for store reviews.

---

*Note: This plan assumes the MVP (achievements, progression, arena, deck builder) is complete and stable before starting platform work.*
