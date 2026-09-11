# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

EIEF is a React/TypeScript frontend for a school management platform (École Internationale les Enfants du Futur), serving four roles: admin, enseignant (teacher), parent, and élève (student).

**Note:** README.md and DOCUMENTATION.md describe the stack as Vite, but the app is actually bootstrapped with Create React App (`react-scripts`, see `package.json`) — there is no `vite.config`. Use CRA commands and `REACT_APP_*` env vars, not Vite ones.

## Commands

- `npm start` — run the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm test` — run tests in CRA/Jest watch mode
- `CI=true npm test` — run all tests once, non-interactively (use this for a single verification pass)
- `npm test -- --testPathPattern=App.test` — run a single test file
- No `npm run lint` script exists; ESLint rules come from CRA's `eslintConfig` (`react-app`, `react-app/jest`) and run as part of `npm start`/`npm run build`.

## Environment

- `REACT_APP_API_BASE_URL` (see `.env.example`) — backend API base URL, defaults to `http://127.0.0.1:8080/api/v1` if unset (`src/services/api.ts`).

## Architecture

### Role-based portals

Each role has a parallel structure repeated four times:

- `src/pages/<role>/` — Dashboard, and role-specific pages (Notes, Classes, Paiements, etc.)
- Routes are nested under `/admin`, `/enseignant`, `/parent`, `/eleve` in `src/App.tsx`, each wrapped in `<ProtectedRoute allowedRoles={[...]}>`.
- `LayoutRoutes` (defined inline in `App.tsx`) derives the current page from the URL and looks up a `{title, subtitle}` pair from a per-role table, then renders the shared `Layout` (`src/components/layout/Layout.tsx`) with role/user/page info. When adding a new page under a role, add both the `<Route>` in `App.tsx` and an entry in that role's page-config table in `LayoutRoutes`, or the sidebar/header title will silently fall back to the dashboard's.
- Public/marketing pages (`Accueil`, `Programmes`, `Admission`, `Contact`, and per-role `*Landing` pages) live at the top of `src/pages/` and are unauthenticated.

### Auth

- `src/store/authStore.ts` (Zustand + `persist`) holds `user`, `token`, `isAuthenticated`, `isInitialized`. Persisted to `localStorage` under the key `auth-storage`.
- `ProtectedRoute` (`src/components/shared/ProtectedRoute.tsx`) blocks on `isInitialized`/`isLoading`, redirects to `/login` if unauthenticated, and redirects to the user's own role dashboard if their role isn't in `allowedRoles`.
- `App.tsx` calls `initializeAuth()` once on mount to restore the session from the persisted token before any protected route renders.

### API layer

- `src/services/api.ts` exports `apiRequest<T>()`, a `fetch` wrapper that: reads the token from `localStorage`'s `auth-storage` (falling back to an explicit `token` option), sends it in a custom `enfantsfuture-auth-token: enfantsfuture <token>` header, expects responses shaped as `{ data: T }`, and throws `ApiError` (with `status`/`details`) on failure or malformed envelopes.
- Domain services in `src/services/*Service.ts` wrap `apiRequest` per resource (auth, users, classes, grades, attendance, library, transport, cafeteria, store, schedule, admin).
- Data fetching in `src/hooks/*` is **not consistent**: some hooks (`useSchedule`, `useAttendance`, `useTeacher`, `useClass`) use `@tanstack/react-query` (provider set up in `src/index.tsx`); others (`useAdminDashboard`, `useAdminSettings`, `useUsers`, `useLibrary`, `useTransport`) hand-roll `useState`/`useEffect`/`useCallback` with their own local `getToken()` from `localStorage`. Match the existing pattern of the hook/file you're editing rather than mixing the two.
- Domain types live in `src/types/` (`auth.ts`, `academic.ts`, `library.ts`, `transport.ts`).
- `src/data/*.json` holds static mock data (élèves, enseignants, livres, paiements, produits) still used in places pending full backend integration.

### Styling

- Tailwind, dark mode via the `class` strategy (`tailwind.config.js`). Custom color palettes `bleu`/`or` (primary institutional colors) and `rouge`/`vert` are defined there — prefer these tokens over raw Tailwind colors for on-brand UI.
