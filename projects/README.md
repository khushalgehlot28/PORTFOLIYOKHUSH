# Full-Stack Starter

A small, extensible starter application built with React, Vite, Express, and MongoDB/Mongoose. The example is a task list with a complete API-backed create, read, update, and delete flow.

## Requirements

- Node.js 20 or newer
- npm
- A MongoDB instance (local or hosted)

## Get started

1. From this directory, install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `server/.env` and set `MONGODB_URI` to your MongoDB connection string. Set `CLIENT_ORIGIN` to the URL where the browser client runs.

3. Start the API and frontend:

   ```sh
   npm run dev
   ```

4. Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

The API runs on `http://localhost:5000` by default. The Vite development server proxies `/api` requests to it.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Run the API and frontend together |
| `npm run dev:server` | Run only the API with Node's watch mode |
| `npm run dev:client` | Run only the Vite development server |
| `npm run build` | Create the optimized frontend build in `client/dist` |
| `npm start` | Start the API in production mode |
| `npm test` | Run API validation unit tests |

## Project layout

```text
client/
  src/
    api/          API client
    App.jsx       Example task-list UI
    main.jsx      React entry point
    styles.css    Responsive starter styles
server/
  src/
    config/       Environment configuration
    controllers/  Request handlers
    middleware/   Error handling and async utilities
    models/       Mongoose schemas
    routes/       API routes
    utils/        Request validation
```

## API

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | API and database readiness |
| `GET` | `/tasks` | List tasks |
| `POST` | `/tasks` | Create a task (`{ "title": "Example" }`) |
| `PATCH` | `/tasks/:id` | Update a task title and/or completion state |
| `DELETE` | `/tasks/:id` | Delete a task |

Errors use a consistent JSON shape: `{ "error": "Message" }`. The API validates input, reports malformed IDs and validation failures as client errors, and avoids exposing internal error details in production.

## Configuration

The API loads environment variables from `server/.env`:

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `NODE_ENV` | `development` | Runtime environment |
| `MONGODB_URI` | — | MongoDB connection string (required) |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed browser origin |

For deployment, configure these variables in the hosting provider, build the frontend with `npm run build`, and deploy the static frontend and API according to your hosting setup. Set `VITE_API_URL` at frontend build time if the API is not served behind the same origin; it should contain the API base path (for example, `https://api.example.com/api`).
