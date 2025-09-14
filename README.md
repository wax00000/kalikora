# Mover MVP

Prototype taxi-collectif web app with an Express API, SQLite database, and React + Framer Motion front end.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```
This launches the API on `http://localhost:3000` and the React dev server on `http://localhost:5173` with API requests proxied to the backend.

Open `http://localhost:5173` to use the prototype UI. Use the admin dashboard at `http://localhost:3000/admin/admin.html`.

## Testing

The `tests.sh` script demonstrates API usage:

```bash
npm run server &
sh tests.sh
```

## Project Structure

- `src/` – Express API and SQLite database
- `web/` – React front end
- `vite.config.js` – Vite configuration with proxy to API
- `database.sql`, `analytics.sql` – Supabase schema and analytics

Environment variables `MAPBOX_TOKEN` etc. may be set to enable optional integrations.
