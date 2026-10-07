# Nexo: clickable demo

React + Vite prototype of the Nexo notary workflow: a staff workspace and the bilingual (FR/EN) client experience,
linked end to end. All data is fictional sample data kept in the browser (localStorage); nothing is sent anywhere.

## Run locally

```bash
npm install
npm run dev
```

## The demo journey

Use **Guided demo** in the dark bar at the top of every screen: it lists the 13 steps, ticks them off as you go,
and has a **Go** button for each. Use **Staff app / Client view** to switch sides, and **Reset** before each presentation.

1. Sign in (any password).
2. **Leads**: open Émilie Gagnon's inquiry and send the mini-mandate (quote comes from the fee table).
3. **Client view**: Émilie opens the email in her inbox and accepts. File 26-0430 is created automatically.
4. Émilie completes the questionnaire and uploads 2 IDs (expired IDs are caught), then passes the face check.
5. **ID review**: approve her IDs.
6. **File → Fees & contract**: send the service contract for e-signature.
7. Émilie signs from her inbox.
8. **File → Overview**: record lender instructions. The booking link is emailed automatically.
9. **File → Title & closing**: complete the title-search checklist.
10. Émilie books her signing (in person or Teams).
11. Mark the deed signed in Consigno, upload and publish the final documents.
12. Émilie downloads them from the secure portal (any 6-digit code).
13. Copy the Procardex summary and close the file.

Every other page is clickable too: Overview, Files (tabs and filters), Calendar, Templates (editable),
Automations (toggle and add rules), Settings (firm, team, fee table, integrations, privacy), search,
notifications and the account menu.

## Deploy to GitHub Pages

**Option A: with Git (recommended)**

```bash
git init && git add . && git commit -m "Nexo prototype"
git branch -M main
git remote add origin https://github.com/<you>/nexo-prototype.git
git push -u origin main
```

**Option B: in the browser, no Git**

1. Create a new repo on github.com (e.g. `nexo-prototype`).
2. Click **uploading an existing file** and drag in everything from this folder, including the hidden `.github` folder.
   On a Mac, press `Cmd + Shift + .` in Finder to show hidden folders. If it won't upload, create the file
   `.github/workflows/deploy.yml` with **Add file → Create new file** and paste its contents.
3. Commit to `main`.

**Then, for both options:**

- On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- The included workflow builds and publishes automatically (check progress in the **Actions** tab, ~1–2 min).
- The site appears at `https://<you>.github.io/nexo-prototype/`. Every new push redeploys it.

The repo can be private only on paid GitHub plans; on a free plan, Pages needs a public repo.

Routes use hash URLs (`/#/app/files/26-0430`), so deep links work on GitHub Pages without extra config.

## Where things live

| Path | What |
|---|---|
| `src/data.js` | Seed data: leads, files, staff, templates, automation rules, **demo fee rates** |
| `src/logic.js` | Workflow stages, fee calculation, guided-demo steps |
| `src/store.jsx` | All actions (staff and client update the same state; emails and notifications are generated here) |
| `src/i18n.js` | Client-facing copy and client emails in French and English |
| `src/layouts.jsx` | Demo bar, guided demo, staff shell (sidebar, search, notifications), client shell |
| `src/pages/staff/*` | Overview, Leads, Files, File detail, ID review, Calendar, Templates, Automations, Settings |
| `src/pages/client/*` | Inbox, quote acceptance, questionnaire, e-signature, booking, portal, my-file tracker |
| `public/logo.svg` | Logo (replace with the final artwork; keep the file name) |
