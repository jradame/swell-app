# Swell - Surf Session Tracker

A mobile-first surf session tracker built with React Native and Expo. Connects to the Swell backend (Next.js, Neon PostgreSQL, Clerk) via Bearer token auth. Live on the iOS App Store.

App Store: [apps.apple.com/us/app/swell/id6761311243](https://apps.apple.com/us/app/swell/id6761311243)

Web version: [swelltrackerapp.com](https://swelltrackerapp.com)

---

## What it does

Swell lets surfers log sessions, track wave height and duration, rate conditions with a 1-5 star system, and view progress over time. The home screen pulls live swell data and tide information for 29 spots across Hawaii, West Coast, Gulf Coast, East Coast, Puerto Rico, and International regions.

Sessions are stored in a real PostgreSQL database and sync across the web app and native app using the same user account.

---

## Stack

- React Native with Expo SDK 54
- Expo Router for file-based navigation
- Clerk Expo SDK for authentication (production instance on swelltrackerapp.com)
- Expo SecureStore for token caching
- Open-Meteo Marine + Weather API for live conditions and forecasts
- NOAA Tides and Currents API for tide predictions and water temperature
- Swell backend API (Next.js + Neon PostgreSQL + Prisma) for session data
- EAS Build configured for App Store submission

---

## Screens

**Home** - Time-of-day greeting, region tabs, spot selector, live conditions widget (wave height, period, wind speed, water temperature, quality badge), tide predictions, stat cards, and recent sessions list.

**Log** - Region and spot selector, date picker, wave height, duration, board type, star rating, and notes. Save is disabled until required fields are filled.

**History** - Full session list with filter chips (All, This Month, Best Rated, Biggest Waves), color-coded rating pills, delete with confirmation modal.

**Progress** - Session streak, total sessions, average wave height, monthly bar chart, and top spots ranked by session count.

---

## Design system

- Background: `#0D1B2A`
- Card surface: `#1B2D3F`
- Gold (brand): `#C9A96E`
- Blue (data): `#38bdf8`
- Typography: Syne (headings), DM Sans (body)

---

## Project structure

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
api.js               API calls to backend, Open-Meteo, and NOAA
spots.js             29 surf spots with regions, coordinates, and NOAA station IDs
theme.js             Design tokens
assets/
images/
icon.png           App icon (1024x1024)
splash-icon.png    Splash screen image

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

Scan the QR code with Expo Go on your phone. The app connects to the live backend at swelltrackerapp.com by default.

---

## Auth

Authentication is handled by Clerk on a production instance tied to swelltrackerapp.com. The native app uses the Clerk Expo SDK with SecureStore token caching. On sign-in, a JWT is stored and passed as a Bearer token on every API request to the backend.

The backend API routes accept both Clerk session cookies (web) and Bearer tokens (native) so both apps write to the same database.

---

## Building for production

EAS Build is configured and linked to the Expo project. Requires an Apple Developer account for iOS App Store submission.
```bash
eas build --platform ios --profile production
```

After a successful build:
```bash
eas submit --platform ios
```

---

## Related

- Swell backend: [github.com/jradame/swell-v3](https://github.com/jradame/swell-v3)
- Portfolio: [justinadame.com](https://justinadame.com)

---

Built by Justin Adame - UX Designer and Frontend Developer based in Austin, TX.