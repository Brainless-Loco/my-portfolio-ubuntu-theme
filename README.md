# tonmoyOS Portfolio

## Admin panel

Open `/admin` directly and sign in with an email and password enabled in Firebase Authentication. Set the `VITE_FIREBASE_*` values from your Firebase project in the app environment; see `.env.example`. Portfolio content, Recent Activity entries, terminal commands, and schedules are synced through Firestore. See [DATABASE_README.md](./DATABASE_README.md) for collection layout, security rules, and admin custom-claim setup.

The public portfolio sections are available at `/home`, `/experience`, `/projects`, `/certifications`, `/gallery`, `/skills`, `/english`, `/education`, `/honors`, `/activities`, `/publications`, and `/news`.
