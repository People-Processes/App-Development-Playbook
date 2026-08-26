# People Processes — Engineering Docs (single-file version)

Four HTML files. No folders, no assets, no build step. Every page carries its own CSS and JavaScript
inside it, so nothing can 404.

Use this version if uploading folders to GitHub gave you trouble.

---

## Upload it

1. Go to your repository on github.com.
2. **Add file → Upload files.**
3. Drag in all four `.html` files at once.
4. Commit.
5. **Settings → Pages → Build and deployment.** Source: *Deploy from a branch*.
   Branch: `main`, folder: `/ (root)`. Save.
6. Wait about a minute, then load the URL shown at the top of that Settings page.

That is the whole thing. There are no other files to upload for the site to work.

## The files

| File | What it is |
|---|---|
| `index.html` | Landing page. This is what loads at the site root |
| `playbook.html` | The App Development Playbook, 21 sections |
| `skills.html` | Guide to the Claude skills |
| `collaboration.html` | The Dolie + Lucky working agreement |

All four link to each other with plain relative links, so they work at any URL, including a project
subpath like `username.github.io/repo-name/`.

## Optional extras

These are not needed for the site to run. Add them when you can:

- `.nojekyll` — an empty file at the repo root. Not required for this version, but harmless and it
  prevents surprises if you add folders later.
- `docs/CREATE-RELEASE-NOTES-SKILL-IN-REPLIT.md` — Lucky's setup guide for the git-based
  release-notes skill.
- `docs/prd/TEMPLATE.md` — the PRD template.

To add a file inside a folder through the web UI: **Add file → Create new file**, then type the whole
path into the filename box, for example `docs/prd/TEMPLATE.md`. Typing a `/` creates the folder.

---

## Editing

Each file is self-contained, which is the point, and also the tradeoff: the CSS is duplicated across
all four. If you change a colour or a spacing value, you have to change it in all four files, or use
the multi-file version instead.

**The multi-file version** lives in `pps-engineering-docs/` in the same project folder. It has one
shared `assets/site.css` and `assets/site.js`, which is the better structure for a repo you will edit
often. Use it once you are working through git rather than the web uploader.

Both versions produce identical pages.

---

## If the styling still does not load

Open the deployed page, press F12, and look at the **Console** and **Network** tabs.

| What you see | What it means |
|---|---|
| No failed requests, page still plain | The upload replaced the file with something else. Check the file size in the repo. `playbook.html` should be around 140 KB |
| `fonts.googleapis.com` blocked or failed | Only the font is missing. The page falls back to Arial and everything else still works |
| A 404 for anything | You uploaded the multi-file version by mistake. These four files reference no other files at all |
| Page is blank | The file did not upload completely. Re-upload it |
