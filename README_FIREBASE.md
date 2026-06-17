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
