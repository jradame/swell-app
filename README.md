# Swell - Surf Session Tracker

A mobile-first surf session tracker built with React Native and Expo. Connects to the Swell V3 backend (Next.js, Neon PostgreSQL, Clerk) via Bearer token auth. Runs on iOS and Android through Expo Go during development, with EAS Build configured for App Store and Google Play submission.

Live web version: [swell-v3-bice.vercel.app](https://swell-v3-bice.vercel.app)

---

## What it does

Swell lets surfers log sessions, track wave height and duration, rate conditions with a 1-5 star system, and view progress over time. The home screen pulls live swell data from the Open-Meteo Marine and Weather APIs for any of 29 spots across Hawaii, West Coast, Gulf Coast, East Coast, Puerto Rico, and International regions.

Sessions are stored in a real PostgreSQL database and sync across the web app and native app using the same user account.

---

## Stack

- React Native with Expo SDK 54
- Expo Router for file-based navigation
- Clerk Expo SDK for authentication
- Expo SecureStore for token caching
- Open-Meteo Marine + Weather API for live conditions
- Swell V3 API (Next.js + Neon PostgreSQL + Prisma) for session data
- EAS Build configured for App Store and Google Play

---

## Screens

**Home** - Time-of-day greeting, region tabs, spot selector, live conditions widget (wave height, period, wind speed, quality badge), stat cards, and recent sessions list.

**Log** - Region and spot selector, date picker, wave height, duration, board type, star rating, and notes. Save is disabled until required fields are filled.

**History** - Full session list with filter chips (All, This Month, Best Rated, Biggest Waves), color-coded rating pills, delete with confirmation modal.

**Progress** - Session streak, total sessions, average wave height, monthly bar chart, and top spots ranked by session count.

---

## Design system

The native app shares the same gold/blue design language as V3.

- Background: `#0D1B2A`
- Card surface: `#1B2D3F`
- Gold (brand): `#C9A96E`
- Blue (data): `#38bdf8`
- Typography: Syne (headings), DM Sans (body)

---

## Project structure

```
app/
  _layout.jsx          ClerkProvider root, font loading, auth gate
  (auth)/
    sign-in.jsx        Email + verification code flow
    sign-up.jsx        Create account flow
  (tabs)/
    _layout.jsx        Tab bar with Ionicons
    index.jsx          Home screen
    log.jsx            Log session screen
    history.jsx        Session history screen
    progress.jsx       Progress and stats screen
lib/
  api.js               All API calls to V3 backend
  spots.js             29 surf spots with regions and coordinates
  theme.js             Design tokens
assets/
  images/
    icon.png           App icon (1024x1024)
    splash-icon.png    Splash screen image
```

---

## Getting started

Clone the repo and install dependencies:

```bash
git clone https://github.com/jradame/swell-native.git
cd swell-native
npm install
```

Start the development server:

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone. The app connects to the live V3 API at swell-v3-bice.vercel.app by default.

---

## Auth

Authentication is handled by Clerk. The native app uses the Clerk Expo SDK with SecureStore token caching. On sign-in, a JWT is stored and passed as a Bearer token on every API request to the V3 backend.

The V3 API routes accept both Clerk session cookies (web) and Bearer tokens (native) so both apps write to the same database.

---

## Building for production

EAS Build is configured and linked to the Expo project. Requires an Apple Developer account ($99/year) for iOS App Store submission.

```bash
eas build --platform ios
eas build --platform android
```

After a successful build:

```bash
eas submit --platform ios
eas submit --platform android
```

---

## Related

- Swell V3 web app: [github.com/jradame/swell-v3](https://github.com/jradame/swell-v3)
- Portfolio: [justinadame.com](https://justinadame.com)

---

Built by Justin Adame - UX Designer and Frontend Developer based in Austin, TX.