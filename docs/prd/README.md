# PRDs

The written plan for a feature, agreed before anyone builds it.

## Where these belong

**In the product repository, not here.** A PRD lives next to the code it describes, under
`/docs/prd/`, so it is versioned with that code and findable by anyone with repo access.

The copy in this documentation repo is the **template only**, plus any PRD that describes the
documentation site itself.

## Naming

```
YYYY-MM-DD-feature-name.md
2026-09-02-physical-poster-ordering.md
```

The date is when the PRD was started, not when the feature ships.

## When a PRD is required

- The work is bigger than roughly one week.
- It changes a user-facing workflow.
- It touches money, client data, or compliance evidence.
- It carries an open business decision.
- It is going to be handed to an AI tool to build.

Anything smaller is a single work item. Use the templates in the playbook instead.

## The lifecycle

1. **Draft** — being written, questions still open.
2. **In review** — with the approver.
3. **Approved** — decomposed into an epic, a release and items.
4. **Built** — the release shipped. Note anything that shipped differently from the spec.

Update the status line when it changes. A folder of PRDs all marked Draft is a folder nobody
trusts.

## The fastest way to write one

Ask Claude: *"write a PRD for [the thing]"*. The `sprints-prd` skill writes all ten sections,
asks for what it cannot infer, decomposes the result into an epic, a release and items, and
creates them in Zoho Sprints once you approve. See the Claude Skills Guide on the docs site.
