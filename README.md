# Prayer Journal

A personal prayer journal (**PWA‑friendly**) with reminders, reflection views, answered‑prayer tracking, and a simple “Prayed” button to record each time you pray. Hosted on **GitHub Pages**.

Live site: **https://elijahblake81.github.io/prayer-journal/**

> ℹ️ **Sign‑in required:** Use **“Sign in with Google”** to sync your prayers to **Firebase Firestore**. When signed out, the app can still work in a limited, local‑only mode.

---

## Features

- **Add Prayer** — Category, tags, date, optional Scripture reference  
- **Edit Prayer** — Update any details later (same UI as Add)  
- **Mark as Answered / Mark as Open** — Record when/how a prayer was answered; easily revert if tapped by mistake  
- **“Prayed” Button** — One‑tap **increment** of a `prayedCount` with `lastPrayedAt` timestamp  
- **Reminders** — Daily **time** picker and optional weekly reminders using the browser Notification API  
- **Reflection** — Past 7 days view plus “Answered this month”  
- **Toasts** — Non‑blocking feedback on save/update/mark/unmark/delete/prayed

---

## How it stores your data

- **Signed in:** Data is stored under your Google account in **Firebase Firestore** (per‑user path `users/{uid}/prayers`).  
- **Signed out (fallback):** Some actions may use the browser’s **localStorage** only; they won’t sync until you sign in.  
- **Privacy:** Your private prayers are only readable by you. (Public sharing is not enabled yet.)

---

## Tech Stack

- **React 18** + **Vite**
- **React Router**
- **Firebase** (Auth: Google; Firestore with local cache)
- **date‑fns**
- Lightweight global **Toast** provider
- Deployed to **GitHub Pages**

---

## Run Locally

1) **Prereqs**
- https://nodejs.org/ **v18+**  
- A Firebase project (if you want to run with your own backend)

2) **Clone & install**
```bash
git clone https://github.com/elijahblake81/prayer-journal.git
cd prayer-journal
npm install