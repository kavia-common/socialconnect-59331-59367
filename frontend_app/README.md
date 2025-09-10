# Lightweight React Template for KAVIA

This project now includes TailwindCSS, Axios API client, Zustand auth store, Framer Motion, and Socket.IO client.

## Quick start

1. Copy environment example:
   - `cp .env.example .env`
   - Set `REACT_APP_API_BASE_URL` to your backend API base (e.g., http://localhost:5000/api)
2. Install dependencies:
   - `npm install`
3. Run:
   - `npm start`

## Tech included
- TailwindCSS (with PostCSS and autoprefixer) – already wired in `src/index.css` and `tailwind.config.js`
- Axios API client – `src/services/api.js` (reads REACT_APP_API_BASE_URL)
- Zustand auth store – `src/store/authStore.js` with token persistence
- Framer Motion and Socket.IO client – installed, ready to use

Other CRA details and docs remain applicable; see Create React App docs for advanced usage.
