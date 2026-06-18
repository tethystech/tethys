Firebase setup
===============

1) Create your Firebase project in the Firebase Console.

2) Get web app config:
   - Console → Project settings → Your apps → Add web app (if none) → Copy the config object.
   - Create a file `firebase-config.js` in the project root with:

```js
export default {
  apiKey: "<API_KEY>",
  authDomain: "<PROJECT>.firebaseapp.com",
  projectId: "<PROJECT>",
  storageBucket: "<PROJECT>.appspot.com",
  messagingSenderId: "<SENDER_ID>",
  appId: "<APP_ID>",
  measurementId: "G-..."
};
```

3) Keep `firebase-config.js` private — add it to `.gitignore` (this repo contains `firebase-config.example.js` as a template).

4) Add authorized domains for Authentication (important for OAuth and redirects):
   - Console → Authentication → Settings → Authorized domains → Add your domain(s)
   - For GitHub Pages add `USERNAME.github.io` (or your custom domain). For local testing add `127.0.0.1` and `localhost`.

5) Firestore rules:
   - Edit `firebase.rules` locally, then publish rules with:

```bash
firebase deploy --project <PROJECT_ID> --only firestore:rules
```

6) If you host on GitHub Pages, ensure the deployed site uses the same Firebase project and add that domain to Authorized domains.

7) Local testing: serve files over HTTP (not `file://`) using a static server: e.g.

```bash
# Python 3
python -m http.server 8000

# or use Live Server extension in VS Code
```
Security note — Firebase configuration and roles

- Do not commit `firebase-config.js` with your real API keys. This file is ignored by `.gitignore`.
- Create `firebase-config.js` in the project root by copying `firebase-config.example.js` and filling the values from Firebase Console > Project settings > Your apps.
- To give a user admin privileges, create or edit the Firestore document `users/{UID}` and set the field `role` to `"admin"`.

Example steps:

1. Copy the example:

```bash
cp firebase-config.example.js firebase-config.js
```

2. Open `firebase-config.js` and paste your Firebase web app config values.

3. Push your site to GitHub.

4. Add GitHub repository secrets for the workflow:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID`

5. The workflow `.github/workflows/deploy-pages.yml` will create `firebase-config.js` during deployment, so the repo never stores secrets.
