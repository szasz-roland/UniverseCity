# Contributing / change workflow

This project auto-deploys `main` to production on Vercel on every push. That means `main`
should only ever receive changes that are already confirmed working — everything else goes
through a branch first.

## Workflow

```bash
# i.    branch off main for anything non-trivial
git checkout -b feature/whatever-youre-adding

# ii.   make the change, verify it in the browser
npm run dev

# iii.  run the same checks CI runs, before pushing
npm run type-check && npm run lint && npm run build

# iv.   commit
git add <files>
git commit -m "..."

# v.    push the branch
git push -u origin feature/whatever-youre-adding
#       → GitHub Actions CI runs automatically
#       → Vercel builds a preview deployment at a disposable URL (doesn't touch production)

# vi.   open the preview URL, actually use the feature for real

# vii.  only once CI is green AND the preview looks right, merge to main
git checkout main
git merge feature/whatever-youre-adding
git push
#       → THIS triggers the real production deploy

# viii. clean up
git branch -d feature/whatever-youre-adding
```

For a change small enough that a branch feels like overkill (typo, one-line tweak), pushing
straight to `main` is fine — just run the three checks locally first, since that's the only
gate you'll have.

## If a bad deploy reaches production anyway

No git surgery needed — Vercel dashboard → **Deployments** → find the last good one →
**⋯ → Promote to Production**. Rolls back in seconds.

## Before opening a PR (once there are other contributors)

```bash
npm run type-check && npm run lint && npm run build
```

CI runs the same three checks on every push.
