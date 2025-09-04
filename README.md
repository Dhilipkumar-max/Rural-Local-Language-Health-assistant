## Rural Healthcare App

A React + Convex application that provides AI-assisted healthcare features for rural communities, including symptom checking, reminders, emergency help, health records, and more.

### Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS
- Convex (database, functions, auth)
- `@convex-dev/auth` for authentication
- `openai` for AI features

### Prerequisites
- Node.js 18+ and npm
- A Convex project (free) and its Dev URL

### 1) Install Dependencies (Windows CMD)
```bat
cd "C:\Users\Dilip Kumar\OneDrive\Desktop\rural_healthcare_app"
npm install
```

### 2) Start Convex (backend)
In CMD:
```bat
npm run dev:backend
```
Copy the printed Convex URL (looks like `https://<your-deployment>.convex.cloud`).

### 3) Configure Frontend Env
Create `.env.local` at the project root with your Convex URL:
```bat
echo VITE_CONVEX_URL=https://YOUR-CONVEX-URL > .env.local
```
Replace the URL with the one printed by step 2.

If you use OpenAI features, also set:
```bat
echo OPENAI_API_KEY=sk-... >> .env.local
```

### 4) Start Frontend (Vite)
Open a new CMD window in the same folder and run:
```bat
npm run dev:frontend
```
Vite will print a local URL (e.g., `http://localhost:5173`). Open it in your browser.

### Available Scripts
- `npm run dev` — runs frontend and backend together (parallel)
- `npm run dev:frontend` — starts Vite dev server
- `npm run dev:backend` — starts Convex dev server
- `npm run build` — builds the frontend
- `npm run lint` — type-checks (frontend + convex) and does a one-off Convex build

### Project Structure
```
convex/                # Convex functions, schema, and http routes
src/                   # React application source
  components/          # UI components and app screens
  contexts/            # Context providers (e.g. LanguageContext)
  main.tsx             # App entry, ConvexAuthProvider setup
  App.tsx              # Root app shell and auth-gated content
```

### Auth Wiring (where to look)
- `src/main.tsx`: creates `ConvexReactClient` and mounts `ConvexAuthProvider`
- `src/App.tsx`: uses `@convex-dev/auth/react` `Authenticated`/`Unauthenticated` wrappers

### Environment Variables
- `VITE_CONVEX_URL` — required by the frontend to connect to Convex
- `OPENAI_API_KEY` — required for AI features if used

Place frontend variables in `.env.local` (Vite reads `VITE_*`). Do not commit secrets.

### Troubleshooting
- Red squiggles in VS Code after install:
  - Click the TS version in the status bar → "Use Workspace Version"
  - Ctrl+Shift+P → "TypeScript: Restart TS server"
  - Ctrl+Shift+P → "Developer: Reload Window"
- Clean reinstall if types stay unresolved:
  ```bat
  rmdir /S /Q node_modules
  del package-lock.json
  npm install
  ```
- Type-check manually:
  ```bat
  npx tsc -p tsconfig.app.json --noEmit
  ```

### Notes
- Keep the Convex dev server running while developing so the frontend can connect.
- Ensure `.env.local` exists with a valid `VITE_CONVEX_URL` before starting the frontend.

### Features and usefulness

- **AI symptom checker**: Guides users through symptoms and suggests next steps, helping triage before a clinic visit.
- **Medication reminders**: Schedules notifications for doses, refills, and follow-ups to improve adherence.
- **Health records**: Stores basic patient info and encounter notes in a centralized, secure place.
- **Prescription scanner**: Extracts key details from prescription images to reduce manual entry.
- **Emergency help**: One-tap SOS with location and key medical info for faster escalation.
- **Multilingual support**: Language selector with context-aware translations for inclusivity.
- **Authentication**: Simple sign-in/out that gates access to personal data.
- **Offline-friendly UI**: Designed to degrade gracefully with intermittent connectivity and sync when online.

Why it’s useful:
- **Improves access**: First-line guidance where clinicians are scarce.
- **Promotes adherence**: Reduces missed doses and complications.
- **Continuity of care**: Repeat visits benefit from centralized records.
- **Faster triage**: Emergency module saves minutes when they matter most.
- **Inclusive**: Language support lowers barriers for diverse users.
- **Low friction**: Lightweight UI suited to low-end devices and networks.
- **Privacy-conscious**: Convex-backed data model and modern auth patterns.

# Rural Healthcare App
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
 You can find docs about Chef with useful information like how to deploy to production [here](https://docs.convex.dev/chef).
  
This project is connected to the Convex deployment named [`efficient-caterpillar-551`](https://dashboard.convex.dev/d/efficient-caterpillar-551).
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.
