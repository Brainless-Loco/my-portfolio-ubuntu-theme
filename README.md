# tonmoyOS

An Ubuntu-inspired desktop portfolio for exploring my work, experience, projects, and profiles.

**Created by Tonmoy Chandro Das**, also known as **Brainless** or **Loco**.

> This project was created by me with assistance from AI tools and agents, including Google AI Studio, GitHub Copilot, ChatGPT, and others.

## About

tonmoyOS presents a personal portfolio as an interactive desktop environment. Visitors can open portfolio sections from the file-explorer-style interface, browse content, and contact me. Portfolio content is managed through a separate admin panel and can be synchronized across visitors with Firebase.

## Features

- Ubuntu-inspired desktop interface with navigable portfolio sections
- Responsive layout for desktop and mobile
- Sections for experience, projects, certifications, gallery, skills, education, publications, activities, awards, and recent activities
- Categorized Links & Profiles cards with built-in icon choices and optional custom icon images
- Contact form and an admin-only inbox for submitted messages
- Rich-text portfolio content and section/item ordering controls
- Admin panel for editing portfolio content, section visibility, and ordering
- Firebase Authentication and Cloud Firestore synchronization
- Vercel rewrite configuration for direct navigation to client-side routes

## Technology

| Area | Tools |
| --- | --- |
| UI | React 19, TypeScript |
| Development and build | Vite 6 |
| Styling and components | Tailwind CSS 4, Material UI, Emotion |
| State and navigation | Redux Toolkit, Redux Persist, React Router |
| Backend services | Firebase Authentication, Cloud Firestore |
| Icons and rich text | Lucide React, Tiptap |
| Animation | Motion |

### Development tools

- Node.js and npm
- Git and GitHub
- Visual Studio Code
- Google AI Studio, GitHub Copilot, ChatGPT, and other AI assistants used during development

## Getting started

### Requirements

- Node.js 18 or later
- npm
- A Firebase project for authentication, shared portfolio data, and contact messages

### Install and configure

1. Clone the repository and enter its directory:

   ```bash
   git clone https://github.com/Brainless-Loco/my-portfolio-ubuntu-theme.git
   cd my-portfolio-ubuntu-theme
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file by copying `.env.example`:

   ```bash
   cp .env.example .env
   ```

   In PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

4. In `.env`, set the Firebase values from your Firebase project:

   ```dotenv
   VITE_FIREBASE_API_KEY="your-firebase-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

   Enable **Cloud Firestore** and **Email/Password** sign-in in the Firebase console. The `GEMINI_API_KEY` and `APP_URL` entries in `.env.example` are for AI Studio/Cloud Run environments; they are not required by the current portfolio UI.

5. Start the development server:

   ```bash
   npm run dev
   ```

   Open the local URL printed by Vite (by default, `http://localhost:3000`).

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 3000 |
| `npm run lint` | Run the TypeScript check (`tsc --noEmit`) |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Application routes

| Route | Page |
| --- | --- |
| `/` | Portfolio entry page |
| `/desktop` | Desktop home |
| `/home` | Home content |
| `/experience` | Experience |
| `/projects` | Projects |
| `/certifications` | Certifications |
| `/gallery` | Gallery |
| `/skills` | Skills |
| `/english` | English proficiency |
| `/education` | Education |
| `/honors` | Honors and awards |
| `/activities` | Extra-curricular activities |
| `/publications` | Publications |
| `/profiles` | Links and profiles |
| `/news` or `/recent` | Recent activities |
| `/contact` | Contact form |
| `/admin` | Admin sign-in and content management |

## Admin access and Firebase security

Open `/admin` and sign in with a Firebase Email/Password account. Authentication alone does **not** grant administrator access: Firestore writes and inbox reads require the trusted Firebase custom claim `admin: true`. Assign this claim only from a trusted environment using the Firebase Admin SDK; never set it in client-side code.

Deploy the included Firestore rules after selecting your Firebase project:

```bash
firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
```

Portfolio data is publicly readable so the client can display it. Portfolio writes and contact-message reads are admin-only. Visitors can submit validated contact messages, but cannot read, update, or delete them. See [DATABASE_README.md](./DATABASE_README.md) for the Firestore document layout, rich-text image handling, and access-control details.

## Deployment

The repository includes [vercel.json](./vercel.json) with a single-page application rewrite. This allows Vercel to serve the app entry point when a visitor opens a client-side route directly, such as `/publications` or `/gallery`.

For Vercel deployment:

1. Import the GitHub repository into Vercel.
2. Set the five `VITE_FIREBASE_*` environment variables in the Vercel project settings.
3. Use `npm run build` as the build command and `dist` as the output directory.
4. Deploy the Firestore rules separately using the Firebase CLI.

## Project layout

```text
src/
├── components/     Shared UI, desktop apps, and portfolio sections
├── lib/            Firebase, rich-text, and portfolio helpers
├── pages/          Desktop, entry, and admin pages
└── store/          Redux state and persistence
firebase.js         Firebase client configuration
firestore.rules     Firestore access rules
vercel.json         Vercel SPA route rewrite
```

## Acknowledgments

Designed and developed by **Tonmoy Chandro Das (Brainless / Loco)**, with support from Google AI Studio, GitHub Copilot, ChatGPT, and other AI tools.
