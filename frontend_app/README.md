# SocialConnect Frontend

React app with TailwindCSS, Axios API client, Clerk authentication, Framer Motion, and Socket.IO client. Includes routing, Clerk route guards, light/dark mode, and core pages for Feed, Explore, and Profile with infinite scroll.

Clerk notes
- The deprecated prop redirectUrl has been removed from Clerk components. Use fallbackRedirectUrl (preferred) or forceRedirectUrl when you want to always navigate to a specific URL after the flow.
- In development, Clerk may show a banner if using a dev publishable key. This is expected. Provide REACT_APP_CLERK_PUBLISHABLE_KEY from your Clerk project. In production, ensure you use a production publishable key to avoid dev warnings.
- This app sets:
  - <SignIn ... fallbackRedirectUrl="/" />
  - <SignUp ... fallbackRedirectUrl="/" />
  - <RedirectToSignIn fallbackRedirectUrl="/sign-in" />
  - <UserButton afterSignOutUrl="/" /> (this uses afterSignOutUrl, not redirectUrl)

## Quick start

1. Copy environment example:
   - `cp .env.example .env`
   - Set `REACT_APP_CLERK_PUBLISHABLE_KEY` from your Clerk project (publishable key)
   - Set `REACT_APP_API_BASE_URL` to your backend API base (e.g., http://localhost:3001)
   - Optionally set `REACT_APP_SOCKET_URL` (defaults to API base)
2. Install dependencies:
   - `npm install`
3. Run:
   - `npm start`

## Features wired
- TailwindCSS (PostCSS/autoprefixer) – configured in `src/index.css` and `tailwind.config.js`
- Clerk authentication – `ClerkProvider` in `src/index.js`, routes for sign-in/sign-up in `src/App.js`
- Axios API client – `src/services/api.js`, attaches Clerk JWT automatically
- Content API helpers – `src/services/contentApi.js` (feed, explore, posts, users)
- Routing with guards via Clerk – see `src/App.js`
- Framer Motion page transitions – handled in `src/App.js`
- Socket.IO client – `src/services/socket.js`, auto-connects when signed in and shows a connection indicator

## Auth routes
- Sign in: `/sign-in`
- Sign up: `/sign-up`
- Protected routes redirect to sign-in when signed out.

Environment
- REACT_APP_CLERK_PUBLISHABLE_KEY is required.
- REACT_APP_API_BASE_URL is required. REACT_APP_SOCKET_URL is optional and falls back to API base if not set.

Backend endpoints follow the provided OpenAPI; update `.env` to point to your running backend.
