# Creating the release-notes skill in the Replit project

**For: Lucky**
**Time: about ten minutes, once. After that it just works.**

---

## What this is, and why you want it

A **skill** is a folder with one markdown file in it. When Claude is working in a project and you say
something that matches the skill's description, Claude reads the file and follows it. That is the
whole mechanism. No install, no config, no API key.

You already have a `release-notes` skill on your Claude account. It reads the items in a Zoho Sprints
release and writes the note from them. That works when you are talking to Claude in Cowork or on
claude.ai, where the Sprints connector is available.

**It does not work inside the Replit project**, because Claude Code running in Replit has no Sprints
connector. It has something better for this job though: the repository. Commits, merges, branch names
and the item numbers you put in your commit messages are all right there.

So you build a second version that reads git instead of Sprints, and produces the same note in the
same format. Two sources, one output standard.

### When to use which

| Situation | Use |
|---|---|
| You are in Cowork or claude.ai, and the release is tracked in Sprints | The account skill. Just ask for the release note |
| You are in Replit, mid-deploy, and want the note from what actually merged | This one |
| The Sprints release is incomplete or the associations are messy | This one. Git does not lie about what merged |
| You want both, cross-checked | Run both and compare. Anything in one and not the other is a real finding |

That last row is the useful one. If git shows a merge that no Sprints item covers, either someone
shipped unfiled work or an item number is missing from a commit message. Both are worth knowing.

---

## Step 1 — Make the folder

In the Replit file tree, at the **root of the project**, create this path:

```
.claude/skills/release-notes/
```

Three things to watch:

- The leading dot on `.claude` matters. It is part of the name.
- Replit hides dotfiles by default. In the Files pane, open the three-dot menu and turn on
  **Show hidden files** before you start, or you will create it and then not be able to see it.
- If `.claude/` already exists in the project, use it. Do not make a second one.

Fastest way, if you would rather use the Shell tab than the file tree:

```bash
mkdir -p .claude/skills/release-notes
```

---

## Step 2 — Create the file

Inside that folder, create a file named exactly:

```
SKILL.md
```

Capital letters, both words. `skill.md` will not be found.

---

## Step 3 — Paste this in

Everything between the lines below goes into `SKILL.md`, including the `---` block at the top. That
top block is the frontmatter: `name` is how the skill is identified, and `description` is what Claude
reads to decide whether this is the right skill for what you just asked. If the description is vague,
the skill will not trigger when you want it to.

````markdown
---
name: release-notes
description: Write the internal release note for a People Processes product release from the repository history, in the App Development Playbook format. Use when the user says "write the release notes", "what shipped", "draft the release note", "we are deploying", "summarize what changed", "what went out in this release", or asks what changed since the last tag or deploy. Produces the full note as a markdown file in docs/releases/, plus a short version for the team channel.
---

# Release Notes (from the repository)

Write the internal release note for this product, from what actually merged, in the People Processes
App Development Playbook format.

The rule behind the format: **write from the user's side, not the code's side.** The reader wants to
know what changed for them. "You can now search the handbook list by name" is a release note.
"Added a filtered query to the handbook index endpoint" is a commit message.

## What to produce

1. **The full note**, saved to `docs/releases/R#-slug.md`.
2. **A short version** for the team channel, three to six lines, pasteable as-is.

Show both. Save the file only after the user approves the content.

## Step 1 — Work out the range

Ask, or work it out, in this order:

1. If the user named two points ("since R2", "since Friday", "since the last deploy"), use those.
2. Otherwise find the last release: `git tag --sort=-creatordate | head -5`, or the newest file in
   `docs/releases/`.
3. If neither exists, ask what the previous release was. Do not silently summarize the entire history.

State the range you used at the top of your reply, in plain terms: "everything merged since tag
v1.4.0, 23 commits."

## Step 2 — Read the history

```bash
git log --no-merges --pretty=format:'%h %s' <from>..HEAD
git log --merges --pretty=format:'%h %s' <from>..HEAD
git diff --stat <from>..HEAD
```

For anything whose subject line is too terse to write a note line from, read the commit body:

```bash
git show --quiet --pretty=format:'%B' <hash>
```

Pull out the **item numbers** (`ADV-###`) from branch names, commit subjects and merge messages. They
are how a note line traces back to a request.

If a change has no item number anywhere, **say so**. Unfiled work shipping is a process finding, not
a formatting problem, and it belongs at the top of your reply rather than buried.

## Step 3 — Sort what you found

| What it is | Goes in |
|---|---|
| A new user-visible capability | **What's new** |
| A defect that is now gone | **What's fixed** |
| Refactors, dependency bumps, CI, tests, config, formatting | Nowhere. Invisible to users |
| A migration or performance change users will notice | **What's new**, described by its effect |
| Something shipping with a known rough edge | **Known issues**, with the workaround |

Judge from what the code does, not from the commit verb. A commit saying "refactor" that changes what
a screen shows is a user-visible change.

## Step 4 — Write the note

```markdown
# [Product] Release [R#] - [Name]

**Released:** [date] · **Approved by:** [name]

## Headline

One sentence. What you can do now that you could not do before.

## What's new

- **[Feature]:** one line on what it does, from the user's side. (ADV-###)

## What's fixed

- **[The symptom that is gone]:** one line. (ADV-###)

## Known issues

- **[Rough edge]:** what happens, and the workaround.

## Who is affected

Which users see a change, and whether they need to do anything.

## Rollback

How to undo this, and any migration warning.
```

Writing rules:

- **User's side, always.** No endpoint names, table names, component names or library names.
- **One line each.** A feature needing a paragraph needs its own heading, or the release is too big.
- **Name the screen** where the change is visible, so people know where to look.
- **Keep the item number** in parentheses.
- **Say what a fix means now,** not what was broken internally.

## Step 5 — Check the rollback section properly

Do not write "n/a" without looking. Check the range for schema or migration files:

```bash
git diff --name-only <from>..HEAD | grep -iE 'migration|schema|prisma|drizzle|\.sql$'
```

If a migration is present, say so in the note and state whether it is reversible. If it is not, say a
database snapshot is needed before the deploy. This section gets read exactly once, in an emergency,
by someone under pressure.

## Step 6 — The short version

Three to six lines, no headings. Headline, then the two or three things people will notice, then
where the full note is.

```
Advisor R2 is out.

Clients can now order physical posters without leaving the app, and the
poster list shows which ones are out of date.

Also fixed: the review spinner that never resolved, and duplicate rows on
the client Work History tab.

Full note: docs/releases/R2-labor-posters.md
```

Plain language. No emoji unless asked. No stacked exclamation marks.

## Step 7 — Report

Lead with anything that needs a person's attention:

- Changes with no item number.
- Migrations that cannot be reversed.
- Anything you could not describe in user terms, so a human can supply the wording.
- The range you used, so it can be checked.

Then the note, then the short version, then ask whether to save the file.

## Hard rules

- **Never invent a change.** Every line traces to a commit. If a commit is too terse to write from,
  ask rather than guessing what it did.
- **Never claim something shipped that is only on a branch.** Merged into the release branch, or it
  is not in the note.
- **Never include client names, employee names, or any personal information.** Release notes get
  forwarded.
- **Never describe a change in code terms** when a user-facing description exists.
- **Never merge two changes into one line** to shorten the note. Item numbers have to stay traceable.
- **Never write the rollback section without checking for migrations.**
````

---

## Step 4 — Test it

Open the Claude panel in Replit and say:

> write the release notes for what has shipped since the last tag

You should see Claude pick up the skill and start by stating the commit range. If it starts guessing
at features without running `git log`, it did not load the skill. See troubleshooting below.

Try a second phrasing to make sure the description is catching:

> what changed since Friday, draft the note

---

## Step 5 — Commit it

```bash
git add .claude/skills/release-notes/SKILL.md
git commit -m "Add release-notes skill for Claude"
git push
```

Now anyone working in the repo gets the same skill. That is the real advantage of a project skill
over an account skill: it travels with the code, it is reviewable in a pull request, and its history
is visible.

---

## Troubleshooting

| What you see | Why | Fix |
|---|---|---|
| Claude ignores the skill | The file is in the wrong place | It must be exactly `.claude/skills/release-notes/SKILL.md` at the project root, not inside `src/` or a subfolder |
| Claude ignores the skill, path looks right | Filename case | `SKILL.md`, both words capitalized |
| Claude ignores the skill, everything looks right | The frontmatter is malformed | The `---` lines must be the very first and third-ish lines with nothing above them, and `description:` must be one single line with no line breaks in it |
| It triggers when you did not want it | The description is too broad | Narrow it. Remove the phrases that overlap with what you ask about routinely |
| It never triggers on your wording | Your phrasing is not in the description | Add the exact phrase you actually use to the description list |
| You cannot see the `.claude` folder | Replit hides dotfiles | Files pane, three-dot menu, Show hidden files |
| It writes a note but skips git | It is treating it as a writing task | Say "read the git log first" once. If it keeps happening, move the `git log` commands higher in the file |

---

## Keeping the two versions in sync

There are now two release-note skills, and they will drift if nobody watches.

| | Account skill | This one |
|---|---|---|
| Where it lives | Your Claude account | `.claude/skills/` in the Replit repo |
| Reads | Zoho Sprints release items | Git history |
| Also does | Posts a comment to Sprints, fills an empty release goal | Nothing outside the repo |
| Updated by | Saving a new version of the skill | Editing the file and pushing |

**The output format is the contract.** Both produce the same note structure. If the playbook's release
note format changes, both need the change or you will get two different-shaped notes depending on
where you happened to be sitting.

Sanity check every few releases: run both on the same range and compare. Differences are usually real
findings, not bugs in the skills.

---

## Making other skills the same way

The pattern generalizes. Any repeatable thing you explain to Claude more than twice is a candidate.

```
.claude/skills/<skill-name>/SKILL.md
```

Same frontmatter, same idea: `name`, a `description` written as trigger phrases, then the
instructions. Good candidates in this project: a PR description writer, a migration checklist, a
"prepare a deploy" runbook, a bug triage helper.

Two things that make the difference between a skill that gets used and one that does not:

1. **Write the description as the phrases you actually say**, not as a summary of what the skill does.
   Claude matches on it.
2. **Be specific about what it must refuse.** The hard-rules section at the bottom of a skill does
   more work than the instructions above it, because it catches the cases where being helpful would
   produce something wrong.
