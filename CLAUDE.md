# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a personal experimentation repository for exploring Claude Code features, capabilities, and integrations. Experiments here are exploratory and not production code.

## Claude Code Configuration

The `.claude/` directory holds project-level settings:

- `.claude/settings.json` — project permissions
- `.claude/settings.local.json` — local overrides (currently sets `outputStyle` to `Explanatory`)

The `Explanatory` output style activates educational insights before and after writing code. If a new experiment requires a different output style, update `.claude/settings.local.json`.

## Project Structure

```
app/
  games/
    soeg/page.tsx           # Nim-variant game route
    tictactoe/page.tsx      # Tic-tac-toe route
components/
  game/
    GameShell.tsx           # Shared wrapper: score panel + move log (right sidebar)
    ModeSelector.tsx        # Shared 2P / vs AI Easy / vs AI Hard buttons
  Sidebar.tsx               # Left nav: add new games to the GAMES array here
  SoegGame.tsx              # Soeg (misère Nim) game component
  TicTacToeGame.tsx         # Tic-tac-toe game component
hooks/
  useScore.ts               # Tracks wins per player; stable addWin/reset refs
  useGameLog.ts             # Append-only move log; stable addEntry/clear refs
lib/
  nim.ts                    # Nim AI: getEasyNimMove, getHardNimMove (misère strategy)
  tictactoe.ts              # TTT AI: minimax hard, random easy; getWinner, isDraw
types/
  game.ts                   # Shared: GameMode, Player, LogEntry, GameScore
```

## Adding a New Game

1. Create `components/YourGame.tsx` — use `GameShell`, `ModeSelector`, `useScore`, `useGameLog`.
2. Create `app/games/yourgame/page.tsx` that renders `<YourGame />`.
3. Add `{ name: 'Your Game', href: '/games/yourgame' }` to the `GAMES` array in `components/Sidebar.tsx`.
4. Add AI logic to `lib/yourgame.ts` if needed.

## Vercel Deployment

The project is linked to Vercel project `claude-xp` (org `lfpmelonis-projects`).

**Framework setting:** Must be set to `nextjs` on the Vercel platform. This was set via the REST API once and persists. The `vercel.json` at the root reinforces this. If a new project link is created, run:

```bash
TOKEN=$(cat "$APPDATA/com.vercel.cli/Data/auth.json" | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")
curl -X PATCH "https://api.vercel.com/v9/projects/prj_Zbb76YTbG0EEaDMVU5ol0kvQHvyW?teamId=team_ev9Dlg582SgHv6sFucfMPBMG" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"framework":"nextjs"}'
```

**Deploy:** Use `/deploy` (commit + push + `vercel --prod --yes`) or run manually.

**Local dev:** `npm run dev` — starts on port 3000 (or 3001 if occupied).

## Best Practices for Vibe-Coded Projects

These apply to this repo and any similar "experimental, AI-assisted" codebases:

### Structure before scale

Establish shared abstractions (`GameShell`, `useScore`, `useGameLog`) **before** adding the second game, not after. Retrofitting shared structure is harder than building it once and reusing it. When a second similar thing appears, extract the common parts immediately.

### Pure game logic in `lib/`

Keep AI and game rules in framework-agnostic files under `lib/`. This makes them testable in isolation and portable. Never put game logic inside React components.

### Stable hook references matter

Hooks used inside `useEffect` (e.g., `log.addEntry`, `score.addWin`) must return stable function references via `useCallback`. Unstable refs cause infinite loops or missed calls. Declare them with `useCallback` and empty or truly-stable deps.

### AI side effects stay outside state updaters

`setState(prev => ...)` updaters must be pure (React may call them multiple times in Strict Mode). Never call `log.addEntry` or `score.addWin` inside an updater — compute new state in a pure function (`computeMove`), then call side effects after `setGame`.

### Compute state, then commit side effects

Pattern:
```ts
const next = computeMove(state, row, count);   // pure
log.addEntry(...);                              // side effect
score.addWin(...);                              // side effect
setGame(next);                                 // commit
```

### Delay AI moves for UX

A 600–700ms `setTimeout` before AI moves makes the game feel natural. Always return the cleanup function (`clearTimeout`) from `useEffect` to avoid stale moves if game state changes before the timer fires.

### Types as the contract

Define `types/game.ts` early. Shared interfaces (`LogEntry`, `GameScore`, `GameMode`) act as the contract between components, hooks, and lib functions. Changing a type propagates TypeScript errors to every consumer immediately.

### `.gitignore` discipline

Always exclude: `node_modules/`, `.next/`, `*.log`, `.env*.local`, `.vercel/`. Commit `package-lock.json` for reproducible installs.

### Document the non-obvious infrastructure

Things like "Vercel framework must be set via API" are invisible to the next developer (or the next Claude session). Put them in CLAUDE.md, not just in memory.
