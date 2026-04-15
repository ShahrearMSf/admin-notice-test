# admin-notice-test

A Claude Code skill for QA-ing WordPress plugin admin promo notices against their Figma spec and business requirements. Produces a single pass/fail/needs-business-call checklist covering design, visibility, behavior, schedule, and plugin priority.

Tested on plugins that use the [`priyomukul/wp-notice`](https://github.com/priyomukul/wp-notice) library (BetterLinks, BetterDocs, NotificationX, and most wpdeveloper.com plugins), but the procedure generalises to any WP admin notice.

## Install

Place the `admin-notice-test/` folder under your project's `.claude/skills/` directory:

```
<your-project>/
└── .claude/
    └── skills/
        └── admin-notice-test/
            ├── SKILL.md
            ├── scripts/
            ├── references/
            └── assets/
```

Claude Code will pick it up automatically and expose `/admin-notice-test` as an invocable skill.

## Usage

```
/admin-notice-test <plugin-slug>
/admin-notice-test <plugin-slug> --priority
/admin-notice-test <plugin-slug> --no-pro
```

Claude will ask for the inputs listed in [SKILL.md](SKILL.md) before running.

## Dependencies

- [Playwright](https://playwright.dev/) with Chromium installed (reuse an existing project's `node_modules`, or `npm i -D playwright`).
- A local WordPress dev site (the default config targets [Local Lightning](https://localwp.com/) with its bundled MySQL socket).
- Bash + a POSIX `grep`.

## Structure

| Path | Purpose |
|---|---|
| `SKILL.md` | Skill metadata + instructions Claude reads on invocation |
| `scripts/discover-notice.sh` | Grep a plugin folder for notice registration + dismiss wiring |
| `scripts/reset-dismiss.sh` | Delete dismiss storage (user meta / site option / transient) via direct DB |
| `scripts/inspect-notice.js` | Playwright run: visibility + computed styles + dismiss AJAX + screenshots |
| `scripts/check-pro-hides.js` | Playwright run: verify Pro activation hides the notice |
| `references/procedure.md` | Full 6-step procedure |
| `references/wp-notice-library.md` | Internals of `priyomukul/wp-notice` |
| `references/login-quirks.md` | WP login automation gotchas |
| `references/worked-example-betterlinks.md` | First real run (BetterLinks Spring 2026) |
| `assets/checklist-template.md` | Output checklist skeleton |
| `assets/slack-message-template.md` | Short Slack summary template |

## Config format

`scripts/inspect-notice.js` and `scripts/check-pro-hides.js` both read `$CONFIG` (default `/tmp/notice-config.json`):

```json
{
  "baseUrl": "http://localhost:10048",
  "user": "admin",
  "pass": "admin",
  "noticeDomId": "wpnotice-<app>-<notice_id>",
  "proPluginSlug": "betterlinks-pro",
  "dismissButtonTextRegex": "^(Maybe Later|Dismiss)$",
  "pages": [
    { "name": "dashboard",  "url": "/wp-admin/index.php",                mustShow: true },
    { "name": "plugins",    "url": "/wp-admin/plugins.php",              mustShow: true },
    { "name": "plugin-home","url": "/wp-admin/admin.php?page=<slug>",   mustShow: true }
  ]
}
```

## Limitations

- Figma integration is manual — the user pastes the Dev Mode CSS. A Figma MCP integration is planned.
- Assumes a single admin user; multi-role testing is not automated.
- Priority check (`--priority`) requires the user to list priority order explicitly.

## License

MIT — see [LICENSE](LICENSE).
