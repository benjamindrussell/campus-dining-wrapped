# Campus Dining Wrapped

Spotify wrapped for GET dining services: https://wrapped.menu

## Security & Privacy

Giving any external app access to your account carries risk. Always understand what an app does and how it handles your data before using it.

How this app works:

- This is a client-only web app that talks directly to the CBORD GET Services API using CORS. Your browser sends requests straight to `services.get.cbord.com`. There is no proxy server.
- The site is static (HTML/JS/CSS) and has no backend, database, or account system. The source code is public in this repository.
- Your device credentials (`deviceId`, `PIN`, `sessionId`) are stored only on your device in `localStorage`. You can remove them at any time by signing out in the app or clearing this site's data in your browser.

Analytics:

- To count unique users, the app derives your CBORD user ID in your browser, hashes it with SHA-256, and sends only that hash to PostHog as a distinct identifier.
- Automatic tracking is disabled (no autocapture, no page views, no session recording). No transactions, balances, names, emails, device IDs, PINs, or session IDs are sent to PostHog or to me.

Transparency:

- You can use your browser’s Developer Tools (Network tab) to see requests going directly to CBORD and verify what’s sent.
- You can read the code to confirm these behaviors. That's the benefit of open source.
- Review the exact API operations here: [src/lib/api.ts](src/lib/api.ts)

