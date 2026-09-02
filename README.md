# Improx Luxury Calendar — Netlify Edition

This version fixes the Netlify 404/500 and `Unexpected end of JSON input` issues.

Production persistence uses **Netlify Blobs** and stores the events/calendars as JSON values. Local development uses `data/events.json` and `data/calendars.json`.

Set `CALENDAR_EDIT_PASSWORD=improx` in Netlify environment variables. Edit/delete are checked server-side.

Run locally:
1. npm install
2. copy `.env.example` to `.env.local`
3. npm run dev

Deploy normally to Netlify. If prompted, enable Netlify Blobs for the site.

Important: Netlify's deployed function filesystem is not a persistent repository file. The production JSON is therefore stored in Netlify Blobs rather than attempting to rewrite `data/events.json`.
