# Weighsoft Mobile — Running the App

This guide explains how to turn the `Weighsoft.mobile.v1` code into a running app on your phone or emulator.

---

## What's included

This is a working Expo app that:
- Shows a login screen
- Authenticates against the Laravel backend (`/api/authenticate`)
- Displays a real list of hauliers pulled from the database
- Has loading, error, and empty states
- Supports pull-to-refresh and sign out

The full certificate wizard components (forms, validation, uncertainty calculations) are all in `src/` and ready to wire into navigation once a certificate API endpoint exists in the backend.

---

## Prerequisites

You need these installed:
- **Node.js** (you already have this)
- **Expo Go app** on your phone — download from the App Store or Google Play
- The **Laravel backend running** (`php artisan serve`)

---

## Step 1 — Set up the Expo project

The mobile folder needs to become a proper Expo project. From inside `Weighsoft.mobile.v1/`:

```powershell
# Install all dependencies
npm install --legacy-peer-deps

# Install Expo CLI if you don't have it
npm install -g expo-cli
```

Make sure these files are in the **root** of `Weighsoft.mobile.v1/` (not in src/):
- `App.tsx`
- `app.json`
- `babel.config.js`
- `package.json`
- `tsconfig.json`

And these are in `src/`:
- `apiClient.ts`
- `AuthContext.tsx`
- `LoginScreen.tsx`
- `HauliersScreen.tsx`
- (plus all the existing files)

---

## Step 2 — Set the backend URL

Open `src/apiClient.ts` and find this line:

```typescript
export const API_BASE_URL = 'http://10.0.2.2:8000/api';
```

Change it based on how you're running the app:

| Running on | Use this URL |
|---|---|
| Android emulator | `http://10.0.2.2:8000/api` |
| iOS simulator | `http://localhost:8000/api` |
| Physical phone (Expo Go) | `http://YOUR_COMPUTER_IP:8000/api` |

To find your computer's IP on Windows:
```powershell
ipconfig
```
Look for "IPv4 Address" — usually something like `192.168.1.5`. Then use `http://192.168.1.5:8000/api`.

---

## Step 3 — Make the backend accessible

By default `php artisan serve` only listens on localhost. To let your phone connect, run it on all interfaces:

```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

---

## Step 4 — Start the app

From `Weighsoft.mobile.v1/`:

```powershell
npx expo start
```

A QR code will appear. Scan it with:
- **Android:** the Expo Go app
- **iOS:** the Camera app (it opens Expo Go)

The app will load on your phone.

---

## Step 5 — Log in

Use the demo credentials (pre-filled):
- Email: `admin@weighsoft.demo`
- Password: `Password1!`

You should see the list of hauliers load from your database.

---

## Troubleshooting

**"Could not reach the server"**
- Make sure the backend is running with `--host=0.0.0.0`
- Make sure the API_BASE_URL in apiClient.ts matches your setup
- Make sure your phone and computer are on the same WiFi network

**"Invalid email or password"**
- Make sure you ran `php artisan db:seed` so the demo users exist
- Check the email is exactly `admin@weighsoft.demo`

**App won't load / Metro bundler errors**
- Stop the server (Ctrl+C) and run `npx expo start --clear`

---

## What works right now

✅ Login with real backend authentication
✅ JWT token storage and injection on API calls
✅ Real haulier list from the database
✅ Loading / error / empty states
✅ Pull to refresh
✅ Sign out
✅ Role mapping (admin / operator)

## What's built but not yet wired in

These components exist in `src/` and work, but need a certificate API endpoint in the backend before they can be fully connected:
- New Certificate form (Tasks 14-15)
- Certificate wizard with progress (Task 30)
- Uncertainty calculation + summary screen (Tasks 31-33)
- Edit form with optimistic updates (Task 18)
