# DiscoverHealth

Local Healthcare Resource Finder — full-stack project built with **Express**, **SQLite**, and a **React** front-end (Vite).

---

## Prerequisites

* Node.js ≥ 20.x (LTS)
* npm ≥ 10.x

## Quick Start

```bash
# 1. Install all server-side dependencies
npm install

# 2. Install client dependencies & build the React SPA
npm --prefix client install
npm --prefix client run build   # outputs to client/dist

# 3. Start the Express server (serves API + static build)
npm start   # or: node server.js
```

*Open `http://localhost:3000/` to use the app.*

During development you can run the Vite dev server with proxy:
```bash
npm --prefix client run dev
```

---

## Scripts (root **package.json**)
| Script         | Action                                            |
| -------------- | -------------------------------------------------- |
| `start`        | `node server.js` (port 3000)                      |
| `client:dev`   | `npm --prefix client run dev`                     |
| `client:build` | `npm --prefix client run build`                   |

---

## Project Structure (trimmed)

```
/                # project root
│
├─ server.js                 # Express entry point
├─ discoverhealth.db         # SQLite database
├─ controllers/ *.js         # Route controllers
├─ daos/ *.js                # DB access helpers
├─ middleware/ auth.js       # Auth & global error handler
├─ routes/ *.js              # Modular routers
│
├─ client/                   # React front-end (Vite)
│   ├─ src/                  # React source
│   └─ dist/                 # Production build (after `npm run build`)
│
└─ README.md                 # this file
```

> All legacy static files under `/public` have been removed; Express now serves `client/dist/index.html` as the single-page app.

---

## Security Measures

| Area            | Mitigation |
| --------------- | ---------- |
| Passwords       | **bcrypt** hashing (12 rounds) before storage. |
| Sessions        | **express-session** with secure, httpOnly cookies; `sameSite:lax`; store in SQLite; 1-hour expiry. |
| XSS             | React auto-escaping; review & description fields sanitised server-side with DOMPurify (SSR version). |
| SQL Injection   | All DB queries use **parameterised statements** via `sqlite3` placeholders. |
| CSRF            | API uses `sameSite:lax` cookies; state-changing routes require logged-in session. |
| Headers         | **Helmet** sets common security headers. |

---

## Assignment Mapping

| Brief Task | Implementation |
| ---------- | -------------- |
| Part A 1-3 | REST API endpoints (`/api/resources`, `/recommend`, etc.). |
| Part B 4-6 | React SPA with AJAX fetch, recommend button. |
| Part C 7   | Validation & error banners. |
| Part D 8-9 | Leaflet map & Click-to-Add marker. |
| Part E 10-11 | Session login/signup + protected routes. |
| Part F 12-13 | Reviews API & UI. |
| Part G      | React front-end throughout. |
| Part H      | DAOs, controllers, routers, middleware layers. |

---

## Submission Checklist

✔ Node modules **not** included in the ZIP.
✔ `npm install && npm --prefix client install` installs everything cleanly.
✔ App runs on **port 3000**.
✔ Report (2000-3000 words) included separately.
✔ ZIP named with student number.


A simple Express + SQLite web application that helps users find and add local healthcare resources.

## Project Structure

```
discoverhealth/
│
├── package.json               # Dependencies & scripts
├── discoverhealth.db          # SQLite database file
├── server.js                  # Main Express app
├── README.md                  # This file
│
├── /public/                   # Static/public-facing files
│   ├── index.html             # Main page – loads at http://localhost:3000/
│   ├── addResource.html       # Page to add new resource
│   ├── js/
│   │   ├── main.js            # JS for index.html (AJAX, map, etc.)
│   │   └── addResource.js     # JS for addResource.html
│   ├── css/
│   │   └── style.css          # Global styling
│   └── assets/                # Images, logos, icons (keep empty if unused)
│
├── /routes/                   # API endpoints
│   ├── resources.js
│   ├── users.js
│   └── reviews.js
│
├── /db/
│   └── db.js                  # DB connection & helpers
│
└── /middleware/
    └── auth.js                # Auth middleware
```

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the server**

   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000/`.

## Notes

* Keep `node_modules` **out** of any submission ZIP (they can be re-installed).
* The optional `/public/assets` directory is included for images/icons; feel free to delete it if unused.
* Legacy files (`client/`, `server-old.mjs`, `index.mjs`) have been removed to satisfy the assignment structure.
