React Native boilerplate additions

What I added
- src/navigation/AuthNavigator.tsx — Auth stack used while not logged in
- src/navigation/MainTabs.tsx — Bottom tab navigator wired to a custom tab bar
- src/components/BottomTab.tsx — Small, customizable bottom tab bar component
- src/components/Loading.tsx — Reusable loading indicator
- src/components/NotFound.tsx — Simple fallback screen
- src/screens/LoginScreen.tsx — Example login screen
- src/screens/HomeScreen.tsx — Example home screen that uses react-query
- src/screens/SettingsScreen.tsx — Placeholder settings
- src/hooks/useHelloQuery.ts — Example useQuery hook

Notes and next steps
- I did not modify your installed dependencies. You will need to install React Navigation packages and gesture handler/screen libs.
- react-query is already present in your package.json so the example hook will work once navigation deps are installed.

Install the required navigation packages (npm example):

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-gesture-handler
```

For iOS run:

```bash
npx pod-install ios
```

If you prefer yarn:

```bash
yarn add @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-gesture-handler
cd ios && pod install && cd ..
```

Optional (recommended) devtools for react-query:

```bash
npm install -D @tanstack/react-query-devtools
```

How this is organized
- src/navigation — navigation containers and tab wiring
- src/components — small reusable UI primitives (Loading, BottomTab, NotFound)
- src/screens — app screens (Login, Home, Settings)
- src/hooks — example data hooks using react-query

How to extend
- The `BottomTab.tsx` is intentionally tiny and accepts `styleOverrides` prop; you can replace it with icons or add custom renderers per route.
- Replace `useHelloQuery` with real API calls. The hook demonstrates basic cache/stale config.

Quick run (after installing deps):

```bash
npm start
npm run android # or npm run ios
```
