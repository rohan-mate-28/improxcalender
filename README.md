# Improx Luxury Calendar

Premium Next.js calendar using local JSON files instead of a database.

## Run

1. Copy `.env.example` to `.env.local`.
2. Keep `CALENDAR_EDIT_PASSWORD=improx` for the requested password.
3. Install dependencies:

```bash
npm install
```

4. Start development:

```bash
npm run dev
```

5. Open `http://localhost:3000`

The default calendar is `/calendar/improx-group`.

## Storage

Calendar data is stored in:

- `data/calendars.json`
- `data/events.json`

Create, edit, and delete operations update `events.json` on the server.

## Important

This JSON-file approach requires a deployment environment with persistent writable filesystem storage. It is intended for internal/small deployments; high-concurrency production collaboration should eventually move to a database.
