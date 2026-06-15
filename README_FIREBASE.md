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

3. Deploy or run your site locally. `firebase-config.js` will be used at runtime.
