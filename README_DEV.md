# Dev mode & mocks

This app now supports a lightweight dev mode so you can run the full UI without a backend.

## Enabling dev mode

Dev mode is controlled by an environment variable:

```bash
EXPO_PUBLIC_USE_MOCKS=true expo start
```

On web / local development, you can also set this using a `.env` file loaded by Expo, for example:

```bash
# .env.development
EXPO_PUBLIC_USE_MOCKS=true
```

When `EXPO_PUBLIC_USE_MOCKS === 'true'`:

- Authentication is bypassed and the app goes directly to the main tabs.
- All main data hooks (`useProducts`, `useOrders`, `useControls`, `useAdmin`) return local mock data instead of calling the backend.
- Creating a product from **Add New** uses a local in-memory mock store.

## Where mocks live

- `src/mocks/devData.ts` – contains mock objects for:
  - `products` (includes `stock`, `thumbnailUrl`, and Cloudinary-style URLs),
  - `orders`,
  - `report` data,
  - `stockSummary`,
  - `users`,
  - `admin` profile.
- `src/mocks/mockService.ts` – simple wrapper that exposes functions used by hooks:
  - `getProducts`, `getProductDetail`, `createProduct`, `updateProduct`,
  - `getOrders`, `getOrderDetail`,
  - `getSalesReport`, `getStocksOverview`, `getStockList`,
  - `getUsers`,
  - `getAdmin`, `updateAdmin`.

## Product payload shape (dev-mode)

The dev product mocks are aligned with the existing API shape and only add the following:

- `stock: number` – total stock quantity for the product.
- `thumbnailUrl: string` – thumbnail location (Cloudinary-style URL).
- `thumbnail?: string` – used internally in dev-mode create/update flows.

`ProductFormScreen` still posts to `${API_BASE_URL}/products` in non-dev mode. In dev mode the form calls `mockService.createProduct` with a payload that includes `stock`, `cancellable`, `returnable`, `images[]`, and `thumbnail`.

## Theme toggle

A simple theme mode system was added:

- `src/theme/colors.ts` – defines `light` and `dark` palettes and exposes a mutable `colors` object.
- `src/theme/ThemeModeContext.tsx` – provides `ThemeModeProvider` and `useThemeMode()`.

`App.tsx` wraps the whole app with `ThemeModeProvider`. The **Account** screen exposes a _Dark mode_ switch that toggles between light and dark palettes at runtime.

## Safe area & status bar

The app root now uses:

- `react-native-safe-area-context` (`SafeAreaProvider`, `SafeAreaView`),
- `expo-status-bar` with `backgroundColor` bound to `colors.statusBar`.

This ensures the top status bar area matches the header/background color and avoids gaps on both iOS and Android.
