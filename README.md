# Baafiye

Lost and found platform for Mogadishu. People can post items they found, report items they lost, and contact the poster directly.

The repo is split into a React client and an Express server, both talking to MongoDB.

## Features

- Register, verify email, log in, and reset a forgotten password
- Post found items and lost items (authenticated)
- Browse, search, and filter listings by category and district
- Mark your posts as returned or cancel them
- Admin category management
- Contact form
- Somali UI copy, focused on Mogadishu districts
- Rate limiting on auth, posting, and contact endpoints
- Automatic expiry of listings after 90 days

## Tech stack

| Layer | Stack |
| --- | --- |
| Client | React 18, Vite, React Router, Tailwind CSS |
| Server | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT, bcrypt |
| Email | Nodemailer (Gmail App Password) |

## Project structure

```
Baafiye Platform/
├── client/          React frontend (Vite)
├── server/          Express API
├── package.json     Root scripts to install and run both apps
└── README.md
```

## Setup

### Requirements

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Install dependencies

From the repo root:

```bash
npm run install-all
```

### 2. Server environment

Copy the example env file and edit values:

```bash
cp server/.env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

Required:

```
MONGO_URI=mongodb://localhost:27017/baafiye
JWT_SECRET=replace_with_a_long_random_secret
```

Optional but needed for email (registration verification, password reset, and contact):

```
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Gmail requires an [App Password](https://myaccount.google.com/apppasswords), not your normal password.

If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, an admin account is created on first server start.

### 3. Client environment

```bash
cp client/.env.example client/.env
```

The default `VITE_API_URL=/api` uses the Vite proxy in development. You usually do not need to change it locally.

### 4. Run both apps

```bash
npm run dev
```

- Client: http://localhost:3000
- Server: http://localhost:5000
- Health: http://localhost:5000/api/health

Run them separately if you prefer:

```bash
npm run dev:server
npm run dev:client
```

### 5. Seed (optional)

Categories and the admin user are seeded when the server starts. To run seeds on their own:

```bash
npm run seed --prefix server
```

## Notes

- Registration still depends on email sending succeeding. If `EMAIL_USER` / `EMAIL_PASS` are empty, verification emails will fail until you add a Gmail App Password.
- Change the admin password before any public use.
- Do not commit `.env` files. Only `.env.example` files belong in git.
