# SocialConnect Frontend

React app with TailwindCSS, Axios API client, Zustand auth store, Framer Motion, and Socket.IO client. Includes routing, route guards, light/dark mode, and placeholders for core pages.

## Quick start

1. Copy environment example:
   - `cp .env.example .env`
   - Set `REACT_APP_API_BASE_URL` to your backend API base (e.g., http://localhost:3001)
   - Optionally set `REACT_APP_SOCKET_URL` (defaults to API base)
2. Install dependencies:
   - `npm install`
3. Run:
   - `npm start`

## Features wired
- TailwindCSS (PostCSS/autoprefixer) – configured in `src/index.css` and `tailwind.config.js`
- Axios API client – `src/services/api.js`, attaches JWT automatically
- Zustand auth store – `src/store/authStore.js` with token+user persistence
- Routing with guards – see `src/App.js`
- Framer Motion page transitions – `AnimatedRoutes` in `src/App.js`
- Socket.IO client – `src/services/socket.js`, auto-connects on login and shows a connection indicator

## Auth UX enhancements
- Login and Signup forms now include client-side validation with inline errors.
- Signup includes a password strength indicator and username format hint (3-30 chars, letters/numbers/_).
- Error messages returned from API are displayed in a prominent, accessible alert box.
- Post-signup Onboarding flow (`/onboarding`) guides new users with a short welcome and optional profile fields. If the backend returns a token on signup, users are directed to onboarding; otherwise, they’re sent to login after account creation.

Backend endpoints follow the provided OpenAPI; update `.env` to point to your running backend.
