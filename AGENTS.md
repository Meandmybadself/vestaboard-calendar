# Repository Guidelines

## Project Structure & Module Organization
`index.js` bootstraps the worker by loading configuration and starting the scheduler. Core logic lives in `src/`: `config.js` validates environment variables and cron cadence, `scheduler.js` wraps `node-cron`, `calendar.js` parses ICS feeds via ICAL.js, and `vestaboard.js` formats and pushes messages to the Vestaboard API. Assets such as `vb-cal.jpg` sit at the project root alongside `README.md`. Place new source modules under `src/` and keep responsibilities focused (calendar ingestion, message formatting, board transport) to simplify manual testing.

## Build, Test, and Development Commands
Install dependencies with `pnpm install` (or `npm install` if you prefer npm). Run `pnpm dev`/`npm run dev` to invoke `wrangler dev --test-scheduled`, which simulates scheduled triggers using `.dev.vars`. Deploy via `pnpm deploy`/`npm run deploy` once Cloudflare secrets are in place. For quick CLI verification, you can also invoke `node index.js` after exporting the required environment variables.

## Coding Style & Naming Conventions
Stick to 2-space indentation, ES modules, and arrow functions. Prefer `const` unless reassignment is required, and export symbols explicitly (`export const foo`). Use upper-snake-case for environment variables and camelCase for functions and locals. Log messages should stay concise and action-oriented—prefix new logs with the module context (`scheduler`, `calendar`, `vestaboard`) so production traces remain searchable.

## Testing Guidelines
There is no automated suite today. Exercise changes by running `pnpm dev` and watching the simulated cron output to confirm event detection and board updates. When you need rapid feedback, temporarily set `CRON_SCHEDULE='* * * * *'` in `.dev.vars`. Document manual test steps and sample ICS payloads in your PR so reviewers can reproduce scenarios.

## Commit & Pull Request Guidelines
Use short, imperative commit titles (e.g., "Fix recurring event parsing") to match the existing history. Keep commits focused and add body text when explaining edge cases or configuration changes. PRs should describe intent, reference related issues, and include relevant logs or screenshots demonstrating a successful board update. Double-check that no secrets or ICS URLs leak into commits.

## Configuration & Secrets
Configure local runs via `.dev.vars`; never commit this file. For Cloudflare, register secrets using `npx wrangler secret put ICS_CALENDAR_URL` and `npx wrangler secret put VESTABOARD_API_KEY`. Review `src/config.js` before changing defaults so fatal validation stays consistent and contributors understand the expected runtime contract.
