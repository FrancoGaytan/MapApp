# MapLibre setup (dev-client / EAS)

This project includes a port attempt to MapLibre (`@maplibre/maplibre-react-native`). MapLibre requires native modules, so you must build a custom development client or run a native build. Follow these steps.

## Quick overview

1. Install `expo-dev-client` and other native deps.
2. Prebuild native projects (creates `android/` and `ios/`).
3. Build a development client with EAS or run a local native build.
4. Start Metro with `expo start --dev-client` and open the app with the dev client.

## Steps (recommended)

1. Install dependencies (locally):

```bash
npm install expo-dev-client --save-dev
npm install @maplibre/maplibre-react-native --save
```

2. Update `app.json` (already done) with location permissions and any plugin hints.

3. Create a dev build with EAS (recommended):

```bash
# login to EAS if you haven't
eas login
# build development client for android
eas build --profile development --platform android
# or for iOS (requires Apple account)
eas build --profile development --platform ios
```

After the build completes you'll get an APK/IPA to install on your device or emulator.

4. Start Metro for dev-client:

```bash
npm run start:dev
# or
expo start --dev-client
```

5. Open the app in the installed dev-client. The dev-client includes native MapLibre modules.

## Alternative: local prebuild + run

If you prefer local native builds and have Android SDK / Xcode installed:

```bash
npx expo prebuild
# Android
npx react-native run-android
# iOS (macOS)
cd ios && pod install && npx react-native run-ios
```

## Notes & troubleshooting

- Expo Go does NOT include native MapLibre modules; you'll see `Native module not registered` errors in Expo Go.
- If you see file-locking errors on Windows when deleting `node_modules`, close Metro, editors, and any terminal using files; try again.
- If you hit dependency errors with workspaces, prefer installing the published package `@maplibre/maplibre-react-native` (already added to `package.json`).

If you want, I can:
- Add `expo-dev-client` to `package.json` and run the installs here (may fail because builds require EAS and native toolchain).
- Run `npx expo prebuild` here to generate `android/` and `ios/` dirs (only useful if you have SDKs and can run native builds locally or via EAS).

Which of the above do you want me to do next?