# 🌟 EIEF - École Internationale les Enfants du Futur

## Project Overview
EIEF is a comprehensive school management platform (SaaS-like) designed for the **École Internationale les Enfants du Futur**. It centralizes educational management for parents, students, teachers, and administrators, featuring a premium UI with native Dark Mode support and integrated educational games for students.

- **Primary Technologies:** React 19, TypeScript, Zustand, React Router DOM.
- **Styling & UI:** Tailwind CSS, Framer Motion (animations), Lucide React (icons).
- **Architecture:** Role-based Single Page Application (SPA) with a dedicated service layer for API interactions.
- **Backend:** Expected at `http://127.0.0.1:8080/api/v1` (configurable).
- **Service Worker:** Includes PWA capabilities via `public/sw.js`.

## 📂 Directory Structure
- `src/components/`: Reusable UI components.
    - `layout/`: Global layout components (Header, Sidebar, Layout).
    - `shared/`: Shared logic/components (e.g., `ProtectedRoute`).
    - `ui/`: Base design system components (Button, Input, Card, etc.).
- `src/pages/`: Main application pages, organized by user role:
    - `admin/`: Administrator dashboard and management tools.
    - `eleve/`: Student portal (grades, schedule, resources) and **Educational Games** (`jeux/`).
    - `enseignant/`: Teacher portal (classes, communication, resources).
    - `parent/`: Parent portal (finance, student tracking).
    - `manager/`: School management (attendance, user management).
    - `comptabilite/`: Financial and accounting workspace.
    - `auth/`: Authentication pages (Login).
- `src/services/`: API interaction logic.
- `src/store/`: Zustand stores for global state (e.g., `authStore`).
- `src/types/`: TypeScript definitions for domain entities.
- `src/data/`: Local JSON files used for mock data.

## 🚀 Building and Running
The project is currently configured as a Create React App (CRA) project, despite some documentation referencing Vite.

- **Install Dependencies:**
  ```bash
  npm install
  ```
- **Start Development Server:**
  ```bash
  npm start
  ```
  *(Note: Documentation mentions `npm run dev`, but `package.json` uses `npm start`)*
- **Build for Production:**
  ```bash
  npm run build
  ```
- **Run Tests:**
  ```bash
  npm test
  ```

## 🛠️ Development Conventions
- **Naming:** Use PascalCase for components and camelCase for functions and variables.
- **Styling:** Use Tailwind CSS utility classes. Prefer custom theme colors defined in `tailwind.config.js` (`bleu`, `or`, `primary`, `secondary`, etc.).
- **State Management:** Use Zustand stores in `src/store/` for global state.
- **API Calls:** All external requests should go through `src/services/apiRequest` in `src/services/api.ts` to ensure consistent header handling and error management.
- **Routing:** New routes must be added to `src/App.tsx` and protected using the `ProtectedRoute` component if they require authentication or specific roles.
- **Mocking:** If backend endpoints are missing, use the JSON files in `src/data/` as a temporary data source.

## 🌗 Theme Management
The application supports Light and Dark modes. The state is managed globally and persists across sessions. Use `darkMode: 'class'` in Tailwind and ensure components handle the `dark:` prefix where necessary.
