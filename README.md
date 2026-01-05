# Edulytics

Edulytics turns raw student mark sheets (Excel/CSV) into an interactive analytics dashboard. Upload a file, map columns, and explore per-subject and per-student insights (mean, median, mode, max, min, trends, and outliers). The app is built on Next.js, Firebase, and Cloudinary for fast, secure delivery. The repo is split into `client/` (Next.js frontend) and `server/` (Firebase/Genkit/Express backend assets).

## Tech Stack
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind%20CSS](https://img.shields.io/badge/Tailwind_CSS-0EA5E9?logo=tailwindcss&logoColor=white)
![Firebase%20Auth](https://img.shields.io/badge/Firebase_Auth-FFCA28?logo=firebase&logoColor=white)
![Firestore](https://img.shields.io/badge/Firestore-FF6F00?logo=firebase&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white)
![Radix%20UI](https://img.shields.io/badge/Radix_UI-111827?logo=radix-ui&logoColor=white)
![Genkit](https://img.shields.io/badge/Genkit-A855F7?logo=google-cloud&logoColor=white)

## Key Features
- Upload XLSX/CSV grade books and validate before import
- Real-time dashboards with summary stats and charts per subject, class, and student
- Add/manage subjects, marks, and students directly in-app
- Firebase Authentication for secure sign-in; Firestore as the source of truth
- Cloudinary-backed file storage for uploads and previews

## App Flow
1) Root path `/` redirects to `/login` so the first page is the auth screen.
2) Auth gate: choose Login or Sign Up (email/password via Firebase Auth; anonymous also supported if enabled).
3) On successful auth you land in `/dashboard` (layout with header/sidebar) with starter stats and placeholders.
4) Use Upload to import XLSX/CSV; verify column mapping; submit to persist in Firestore and Cloudinary.
5) Review analytics: per-subject and per-student stats, tables, and charts; add/edit subjects, marks, or students inline.
6) Profile/settings: manage basic account details and theme.

## Architecture
- **Frontend**: Next.js 15 (App Router) + Tailwind + Radix UI components
- **Auth**: Firebase Authentication (email/password and anonymous supported)
- **Data**: Firestore scoped per school with subcollections for students, teachers, subjects, marks, and uploads (see [server/docs/backend.json](server/docs/backend.json))
- **Storage**: Cloudinary for uploaded mark sheets
- **Analytics**: Server actions parse spreadsheets, persist records, and compute descriptive stats $\text{mean},\ \text{median},\ \text{mode},\ \text{max},\ \text{min}$ for each subject/class slice

Repo layout:
- [client/](client) — Next.js app, UI, Firebase client, server actions
- [server/docs](server/docs) — data models and backend blueprint
- [server/firestore.rules](server/firestore.rules) — Firestore security rules
- [server/genkit](server/genkit) — Genkit setup for Firebase AI/agents (future backend flows)

Firestore layout (high level):
- schools/{schoolId}/students/{studentId}
- schools/{schoolId}/subjects/{subjectId}
- schools/{schoolId}/marks/{markId}
- schools/{schoolId}/teachers/{teacherId}
- schools/{schoolId}/uploads/{uploadId}
- users/{userId} for profile metadata

More detail is captured in [server/docs/backend.json](server/docs/backend.json) and [server/docs/blueprint.md](server/docs/blueprint.md).

## Prerequisites
- Node.js 18+ (Next.js 15 requirement)
- npm (bundled with Node). yarn/pnpm work if you prefer but scripts below use npm.

## Quick Start
1) Clone and install
```bash
git clone https://github.com/Sayan-CtrlZ/Edulytics.git
cd Edulytics
npm install
```

2) Configure environment variables
- Use [client/.env.example](client/.env.example) as a template and create [client/.env.local](client/.env.local):
```bash
# Firebase client config (used for local dev; App Hosting can inject these automatically)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Cloudinary (required for uploads)
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
```
- Update the bundled fallback config in [client/src/firebase/config.ts](client/src/firebase/config.ts) with the same Firebase values for local development.

3) Run the app
```bash
npm run dev
# opens on http://localhost:9002
```

## Importing Data
- Navigate to the upload flow and select an XLSX/CSV file.
- Columns are parsed server-side; numeric columns feed subject marks, and derived stats populate the dashboard.
- On success, the file is stored in Cloudinary and records are written to Firestore under the active school context.

## Project Scripts
- `npm run dev` – start Next.js (client) with Turbopack on port 9002
- `npm run build` – production build (client)
- `npm run start` – serve the production build (client)
- `npm run lint` – lint with Next.js rules (client)
- `npm run typecheck` – TypeScript type checking (client)

## Deploying to Vercel
- The app lives under [client/](client); Vercel is configured via [vercel.json](vercel.json) with `rootDirectory: client`.
- Set these Environment Variables in Vercel (Production/Preview):
	- `NEXT_PUBLIC_FIREBASE_API_KEY`
	- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
	- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
	- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
	- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
	- `NEXT_PUBLIC_FIREBASE_APP_ID`
	- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
	- `CLOUDINARY_CLOUD_NAME`
	- `CLOUDINARY_API_KEY`
	- `CLOUDINARY_API_SECRET`
- Build command (auto): `cd client && npm run build`; install: `npm install`; output: `client/.next`.
- Use `npm run dev` locally to mirror the production entrypoint.

## API & Data Notes
- Firestore rules live in [server/firestore.rules](server/firestore.rules); structure aligns with the collections listed above.
- Server actions in [client/src/lib/actions.ts](client/src/lib/actions.ts) handle file uploads and Cloudinary integration.
- Firebase initialization intentionally calls `initializeApp()` without arguments first; App Hosting injects config at runtime. Local dev falls back to [client/src/firebase/config.ts](client/src/firebase/config.ts).

## Troubleshooting
- Missing stats or uploads: confirm Cloudinary keys are present and valid.
- Auth issues locally: verify Firebase config matches your project and that the selected auth providers are enabled in Firebase Console.
- Build/type errors: run `npm run lint` and `npm run typecheck` for quick feedback.

## Contributing
Pull requests are welcome. Please open an issue first to discuss scope or proposed changes.
