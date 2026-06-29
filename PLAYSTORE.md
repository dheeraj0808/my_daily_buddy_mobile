# Play Store deployment guide

## Prerequisites

1. [Expo account](https://expo.dev/signup)
2. [Google Play Console](https://play.google.com/console) developer account ($25 one-time)
3. Production backend API URL
4. Privacy policy URL (required by Google Play)

## 1. Configure production API

Update `eas.json` → `production.env.EXPO_PUBLIC_API_URL` with your live API:

```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## 2. Link EAS project

```bash
cd Mobile-app
npm install -g eas-cli
eas login
eas init
```

This adds your `projectId` to `app.json` under `expo.extra.eas`.

## 3. Build Android App Bundle (AAB)

```bash
eas build --platform android --profile production
```

Download the `.aab` from the Expo dashboard when the build completes.

## 4. Play Console setup

1. Create app → **My Daily Buddy**
2. Package name: `com.mydailybuddy.app` (must match `app.json`)
3. Upload the `.aab` to **Internal testing** first
4. Complete required sections:
   - App content (privacy policy, data safety)
   - Store listing (screenshots, description, icon 512×512)
   - Content rating questionnaire

### Store listing copy (starter)

**Short description:** Track habits, tasks, health & goals daily.

**Full description:** My Daily Buddy helps you manage your daily routine with smart reminders, habit tracking, health logging, and long-term goals — all in one clean, simple app.

## 5. Submit via EAS (optional)

After configuring a Google Play service account:

```bash
eas submit --platform android --profile production
```

Place your service account JSON at `./google-play-service-account.json` and update `eas.json` submit config.

## 6. Versioning

- User-facing version: `app.json` → `expo.version` (e.g. `1.0.0`)
- Android build number: auto-incremented by EAS (`autoIncrement: true` in production profile)

## 7. Pre-submission checklist

- [ ] Backend running in production with HTTPS
- [ ] OTP email (SMTP) configured
- [ ] Privacy policy hosted and linked in Play Console
- [ ] App tested on physical Android device
- [ ] Custom app icon & splash (replace default Expo assets)
- [ ] Screenshots for phone (min 2)
- [ ] Data safety form completed accurately

## Local Android test build

```bash
# APK for quick device testing (preview profile)
eas build --platform android --profile preview
```

Or with Expo Go during development:

```bash
npm start
# Scan QR on Android device (same Wi-Fi, set EXPO_PUBLIC_API_URL to your LAN IP)
```
