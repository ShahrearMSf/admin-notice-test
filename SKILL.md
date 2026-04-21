---
name: admin-notice-test
description: QA a WordPress plugin's promo admin notice against its Figma spec and business requirements. Produces a single pass/fail/needs-business-call checklist. Covers design (colors, fonts, spacing), visibility (must-show / must-hide pages), behavior (CTA URL, dismiss scope, Pro-hides-notice), and schedule (campaign window).
version: 1.0.0
invocation: /admin-notice-test <plugin-slug> [--priority] [--no-pro]
---

# Admin Notice Test Skill

Generic tester for WordPress admin promo notices. Works for any plugin — the user provides spec + Figma CSS, the skill inspects the live site and produces a checklist.

## Invocation

- `/admin-notice-test <plugin-slug>` — full check
- `/admin-notice-test <plugin-slug> --priority` — also verify priority vs other active plugins
- `/admin-notice-test <plugin-slug> --no-pro` — skip Pro-hides-notice (no Pro zip available)

## Required inputs (ask the user before starting)

1. **Plugin slug + folder name** (e.g. `betterlinks`)
2. **Pro plugin file** (e.g. `betterlinks-pro/betterlinks-pro.php`)
3. **Local site URL + admin credentials**
4. **Figma CSS export** (Dev Mode → copy CSS for notice frame + buttons + text)
5. **CTA label + expected CTA URL**
6. **Body text** (exact string with emojis)
7. **Campaign window** (start + end)
8. **Must-show pages** (admin URLs / screen IDs)
9. **Must-hide conditions** (Pro active, license active, specific screens)
10. **Dismiss scope per business spec** — `session` / `reload-resets` / `per-user-persistent` / `site-wide-persistent`
11. **Priority vs other plugins** (optional, only for `--priority` mode)

If any of these are missing, ask. Do not guess.

## Procedure

Follow the 6 steps in [references/procedure.md](references/procedure.md). Use the scripts in [scripts/](scripts/) as templates — substitute the plugin-specific values from Step 0 (code discovery).

1. **Discover** — grep the plugin for notice registration. Extract notice ID, DOM wrapper ID, `display_if`, `clear_notices_in_`, start/expire, dismiss AJAX action + storage scope.
2. **Reset dismiss** — delete the storage row (user meta / site option / transient) using [scripts/reset-dismiss.sh](scripts/reset-dismiss.sh).
3. **Activate free, deactivate Pro**.
4. **Playwright inspection** — run [scripts/inspect-notice.js](scripts/inspect-notice.js) with substituted values. Captures DOM presence, computed styles, screenshots, AJAX calls, dismiss persistence.
5. **Activate Pro, re-check** — run [scripts/check-pro-hides.js](scripts/check-pro-hides.js).
6. **Compare vs Figma + produce checklist** — use [assets/checklist-template.md](assets/checklist-template.md).

## Output

One markdown table (columns: `#`, `Category`, `Item`, `Expected`, `Actual`, `Result`). Categories in order: Design, Visibility, Behavior, Schedule, Priority (if tested).

End with: totals · confirmed bugs · needs business confirmation · evidence paths.

## Rules

- Reset dismiss state before asserting "visible" checks.
- Deactivate Pro before asserting "visible" checks.
- Don't auto-fail on spec/code divergences — list under **Needs business confirmation**.
- Match colors loosely: `#5252DC` ≡ `rgb(82,82,220)`.
- Font family match requires the expected family to appear literally in computed `fontFamily` — fallbacks don't count.
- Stay inside the campaign window when testing.
- Don't hard-code plugin specifics — re-discover in Step 0 every run.
- Use Local Lightning's bundled `mysql` binary; system PATH usually has no `mysql`.
- Restore original plugin state after the run (free active, Pro inactive). Restore any Pro folders moved for `is_installed` testing.
- Check `display_if` for `is_installed` vs `is_plugin_active`. If `is_installed` is used, the Pro folder's mere presence hides the notice — move it out to test properly, and report as bug.
- Body font-size: WP's `.notice p` defaults to 13px. If Figma says 14px and actual is 13px, that's a bug in the plugin (missing inline style).
- If Figma uses `text-transform: capitalize`, check whether the actual CSS applies the transform or the text is hardcoded differently. Note the implementation approach in the checklist.
- Plugin activate/deactivate via Playwright can silently fail after rapid state changes. Fallback: update `active_plugins` option directly via mysql.
- For priority tests, move Pro folders of all plugins using `is_installed` so their notices can render, otherwise the test is meaningless.
- Use the skill's own `scripts/inspect-notice.js` and `scripts/check-pro-hides.js` with a per-plugin config JSON at `/tmp/notice-config.json`. Do NOT write inline `inspect-<plugin>.js` files inside unrelated projects (like `BetterLinks-E2E-Test/`) — duplicates skill logic and pollutes other projects.
- Activating Pro plugins by directly writing `wp_options.active_plugins` can break DI-container-based plugins (confirmed: BetterDocs Pro fatals on init). Always toggle Pro through the plugins.php UI so WP's activation hooks fire.
- Slack output rule: when producing the final checklist for Slack paste, strip backticks, em-dashes, and arrow chars from cell contents. Plain ASCII per cell. Keep the table under ~45 rows. This lets Slack's paste detector auto-convert to a table attachment.

## References

- [references/procedure.md](references/procedure.md) — full 6-step procedure
- [references/wp-notice-library.md](references/wp-notice-library.md) — `priyomukul/wp-notice` internals, `is_installed` bug, `screens` restriction
- [references/login-quirks.md](references/login-quirks.md) — WP login automation gotchas
- [references/worked-example-betterlinks.md](references/worked-example-betterlinks.md) — BetterLinks Spring 2026 walkthrough
- [references/worked-example-notificationx.md](references/worked-example-notificationx.md) — NotificationX Spring 2026 walkthrough (surfaced `is_installed` bug)

## Assets

- [assets/checklist-template.md](assets/checklist-template.md) — output checklist skeleton
- [assets/slack-message-template.md](assets/slack-message-template.md) — short Slack summary template

## Scripts

- [scripts/discover-notice.sh](scripts/discover-notice.sh) — grep plugin for notice registration
- [scripts/reset-dismiss.sh](scripts/reset-dismiss.sh) — delete dismiss storage row
- [scripts/inspect-notice.js](scripts/inspect-notice.js) — Playwright inspection (main run)
- [scripts/check-pro-hides.js](scripts/check-pro-hides.js) — verify Pro activation hides notice
