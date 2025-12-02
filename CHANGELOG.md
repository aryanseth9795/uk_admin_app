# Changelog

## UI/UX + Dev-mode mocks update

- Wrapped the entire app with `SafeAreaProvider` and `SafeAreaView` in `src/App.tsx` and wired `expo-status-bar` so the OS status bar uses the theme color.
- Introduced a light yellowish theme and optional dark mode in `src/theme/colors.ts` and `src/theme/ThemeModeContext.tsx`.
- Updated `ScreenContainer` and other screens to rely on the shared theme colors (Blinkit-like feel).
- Added horizontal scroll behaviour for filter chips on Orders and Reports screens to prevent overflow.
- Added a prominent **Add New** button on the Products list screen (`ProductsListScreen`) that opens the existing `ProductFormScreen`.
- Refreshed `ProductFormScreen` styling to match the light theme and ensured product-level stock, cancellable and returnable flags, and thumbnail/image handling are part of the payload.
- Added a new **Account** card to the Controls home screen which opens admin account details.
- Implemented `AdminDetailsScreen` and `AdminEditScreen` with logout, basic admin editing, and a theme mode toggle (light/dark) in the account section.
- Introduced a dev-mode toggle (`src/utils/devToggle.ts`) driven by `EXPO_PUBLIC_USE_MOCKS` to switch between real APIs and local mocks.
- Added dev mock data and a small mock service in `src/mocks/devData.ts` and `src/mocks/mockService.ts`.
- Wired mocks into existing hooks: `useProducts`, `useOrders`, `useControls`, and a new `useAdmin` hook.
