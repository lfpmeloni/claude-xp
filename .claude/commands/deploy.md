Commit all staged and unstaged changes to GitHub, then deploy to Vercel production.

## Steps

1. Run `git status` to check what has changed.
2. Run `git diff` and `git diff --cached` to review the changes.
3. Stage all modified and new files: `git add -A` (warn and skip if any `.env` or secrets files are detected).
4. Generate a concise commit message summarizing the changes (conventional commit style: `feat:`, `fix:`, `chore:`, etc.).
5. Commit with the generated message:
   git commit -m "

6. Push to origin main: `git push origin main`.
7. Deploy to Vercel production: `vercel --prod --yes`.
8. Report the production URL from the Vercel output.

## Notes

- If working tree is clean (nothing to commit), skip steps 2-6 and go straight to the Vercel deploy.
- If push fails due to remote changes, run `git pull --rebase origin main` first, then push again.
- Do not force-push. Do not skip hooks.
