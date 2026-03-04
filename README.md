# Prayer Journal

A personal prayer journal (**PWA‑friendly**) with reminders, reflection views, answered‑prayer tracking, and a simple “Prayed” button to record each time you pray. Hosted on **GitHub Pages**.

Live site: **https://elijahblake81.github.io/prayer-journal/**

> ℹ️ **Sign‑in required:** Use **“Sign in with Google”** to sync your prayers to **Firebase Firestore**. When signed out, the app can still work in a limited, local‑only mode.

---

## Features


### ✏️ Private Prayers
- **Add Prayer** — Category, tags, date, optional Scripture reference  
- **Edit Prayer** — Same UI as Add  
- **Mark as Answered / Mark as Open** — Track answered prayers with notes  
- **🙏 “Prayed” Button** — Atomically increments `prayedCount` and updates `lastPrayedAt`  
- **Reflection View** — Past 7 days, answered this month  
- **Reminders** — Daily (native time picker) and weekly browser notifications  

### 🌍 Public Feed (NEW)
- **Make Public** — Publish a prayer to a global read‑only feed  
- **Public Prayers Page** — Everyone can view all public prayers  
- **Public Prayed Count** — Visitors can click **“Prayed”** on public posts  
- **Data Separation**  
  - Private prayers → `users/{uid}/prayers/{id}`  
  - Public prayers → `publicPrayers/{publicId}`  
  - Only you can publish/unpublish your prayers  
  - No email or personal identity is stored in public posts 


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