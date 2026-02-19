# Prayer Journal

A personal prayer journal app with reminders, reflection views, and answered-prayer tracking. Hosted free on GitHub Pages.

## Features

- **Add Prayer** — Category, tags, date, optional Scripture reference
- **Reminders** — Daily and/or weekly browser notifications
- **Mark as Answered** — Record when and how God answered, with notes
- **Reflection** — Past 7 days view + "Answered this month"

## Run Locally

1. Install [Node.js](https://nodejs.org/) (v18+)
2. Clone this repo and install dependencies:

```bash
git clone https://github.com/elijahblake81/prayer-journal.git
cd prayer-journal
npm install
```

3. Start the dev server:

```bash
npm run dev
```

4. Open http://localhost:5173

## Deploy to GitHub Pages (Free)

1. Create a new repo on GitHub: [github.com/new](https://github.com/new)  
   - Name it `prayer-journal` (or update `base` in `vite.config.js` to match your repo name)

2. Push this project:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/elijahblake81/prayer-journal.git
git push -u origin main
```

3. Enable GitHub Pages:
   - Repo → **Settings** → **Pages**
   - Under "Build and deployment", set **Source** to **GitHub Actions**

4. After the workflow runs, your site will be at:
   - `https://elijahblake81.github.io/prayer-journal/`

## Data Storage

All data is stored in your browser's **localStorage**. Nothing is sent to a server. Your prayers stay on your device.

## Reminders

Reminders use the browser Notification API. For them to work:

- Allow notifications when prompted
- Keep the tab open (or pinned) — background tabs can still receive notifications
- Set your preferred daily time and/or weekly day in **Reminders**

## Tech Stack

- React 18 + Vite
- React Router
- date-fns
- localStorage
