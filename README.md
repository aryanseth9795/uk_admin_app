# UR Shop Admin Expo App

This is an Expo (React Native) admin app for the UR Shop backend.

- Authenticates against `/api/v1/admin/login` with `emailorPhone` + `password`.
- Uses React Query for data fetching and caching.
- Uses Redux Toolkit + redux-persist for auth state.
- Aligns admin routes with the backend design in **UK Server.md**:
  - `POST /admin/login`
  - `GET /admin/allorders/date?query=<range>`
  - `GET /admin/orders/:id`
  - `PUT /admin/orders/`
  - `GET /products`
  - `GET /products/:id`
  - `POST /admin/addproduct`
  - `PUT /admin/products/:id`
  - `GET /admin/reports`
  - `GET /admin/stocks/summary`
  - `GET /admin/stocks?type=...`
  - `GET /admin/alluser`

Reanimated is used for:

- ScreenContainer fade/slide-in on focus (tab transitions feel smooth).
- Animated order and product cards (`FadeInUp` on mount, `FadeOut` on unmount, `Layout.springify()` for reordering).

## Setup

```bash
npm install
npm run start
```

Make sure the Expo SDK / dependency versions match your local Expo CLI. Update `API_BASE_URL` in `src/utils/env.ts` to point at your running backend.
