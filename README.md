# Basic MERN Stack App

A simple MERN (MongoDB, Express, React, Node.js) starter with a header, footer, and empty pages.

## Structure

```
├── backend/          # Express API server
│   ├── config/       # MongoDB connection
│   └── server.js
├── frontend/         # React app (Vite)
│   └── src/
│       ├── components/  # Header, Footer, Layout
│       └── pages/       # Home, About, Services, Contact
└── package.json      # Root scripts to run both
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (or update `MONGODB_URI` in backend `.env`)

## Setup

1. Install dependencies:

   ```bash
   npm run install-all
   ```

2. Copy backend env file (if needed):

   ```bash
   copy backend\.env.example backend\.env
   ```

3. Start MongoDB (if using local MongoDB).

4. Run both frontend and backend:

   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Pages

- **Home** — `/`
- **About** — `/about`
- **Services** — `/services`
- **Contact** — `/contact`

Each page is empty except for a title. Add your content in `frontend/src/pages/`.
