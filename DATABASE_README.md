# Portfolio Firestore data

The app loads portfolio content from Firestore in real time and saves it from `/admin`. Configure the `VITE_FIREBASE_*` values in `.env.example`, enable Firestore and Email/Password Authentication in the Firebase console, and deploy [firestore.rules](./firestore.rules).

## Documents

| Document | Data |
| --- | --- |
| `portfolio/main` | Home rich text |
| `portfolioSections/{sectionId}` | Section label, visibility, ordering, and its content entries |
| `portfolioSections/experience` | Section metadata, professional experience entries, and academic experience entries |
| `portfolioSections/news` | Recent Activity section metadata and entries |
| `portfolioSettings/commands` | Terminal commands |
| `portfolioSettings/schedules` | Schedule items shown in the top-bar calendar |

Section IDs are `experience`, `projects`, `certifications`, `gallery`, `skills`, `english`, `education`, `honors`, `activities`, `publications`, and `news`. Each non-experience section document stores its item array in `entries`. Schedule items have `id`, `title`, `description`, `date` (`YYYY-MM-DD`), and `time` (`HH:mm`).

## Access control

Firestore reads are public so portfolio visitors can load the content. Writes require the trusted Firebase custom claim `admin: true`; email/password authentication alone does not grant administrator permissions. Assign the claim only from a trusted server using the Firebase Admin SDK. Do not set it in client code. Without the claim, admin saves fail visibly with a Firestore permission error.

Rich-text images are embedded as compressed `data:image/...;base64,...` values in HTML. They are never uploaded to Firebase Storage. Images inserted by URL are fetched and embedded too; if the host blocks cross-origin fetching, choose the downloaded file with the image button. Firestore limits each document to 1 MiB, so rich-text images are compressed and cloud saves reject documents that approach that limit. The HTML mode sanitizes source before applying it and allows only YouTube embed iframes.

The app retains Redux Persist as a local cache, but Firestore is the shared source used for live updates and admin saves.
