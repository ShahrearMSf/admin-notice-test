# Test procedure — 6 steps

## Step 0 — Discover the notice in code

Grep the plugin for notice registration. Extract:
- Notice ID (argument to `$notices->add(...)` or equivalent)
- DOM wrapper ID (commonly `wpnotice-<app>-<id>` when using `priyomukul/wp-notice`)
- `display_if` conditions
- `clear_notices_in_` screen-ID suppressions
- Start/expire timestamps
- Dismiss AJAX action + storage scope (user meta / site option / transient)

Use [scripts/discover-notice.sh](../scripts/discover-notice.sh).

## Step 1 — Reset dismiss state

Find the storage location from Step 0, then clear it with [scripts/reset-dismiss.sh](../scripts/reset-dismiss.sh).

Common patterns:
- **User meta** — `priyomukul/wp-notice` default scope=user. Delete from `wp_usermeta` where `meta_key='<app>_<notice_id>_notice_dismissed'`.
- **Site option** — scope=site. Delete from `wp_options` by option_name.
- **Transient** — delete two rows: `_transient_<key>` and `_transient_timeout_<key>`.

## Step 2 — Activate free plugin, deactivate Pro

```bash
wp plugin activate <plugin> --allow-root
wp plugin deactivate <plugin>-pro --allow-root
```

If wp-cli fails on DB socket (common on Local Lightning), toggle via Playwright on `/wp-admin/plugins.php` instead.

## Step 3 — Playwright inspection

Run [scripts/inspect-notice.js](../scripts/inspect-notice.js) after substituting `<SITE_URL>`, `<NOTICE_DOM_ID>`, `<MUST_SHOW_URLS>`, credentials.

Captures per must-show URL:
- DOM presence + visibility
- Computed styles (border-left, bg, font-family, font-size, font-weight) on wrapper + CTA button + dismiss link
- CTA href, label, `target` attribute
- Screenshot (fullPage) → `/tmp/notice-<pagename>.png`

Also verifies dismiss:
- Click "Maybe Later" / "Dismiss"
- Reload → check DOM presence
- Open fresh browser context (same auth) → check DOM presence
- Log the AJAX `action` + POST body

## Step 4 — Activate Pro, re-check

Run [scripts/check-pro-hides.js](../scripts/check-pro-hides.js). Asserts the notice is absent from every must-show page once Pro is active.

## Step 5 — Priority check (only with `--priority`)

1. Activate all relevant plugins' free versions.
2. Reset each plugin's dismiss key.
3. Visit wp-admin dashboard.
4. Confirm only the highest-priority plugin's notice renders (priority order provided by the user).

## Step 6 — Compare vs Figma + produce checklist

Parse the Figma CSS block the user pasted. For each property in [assets/checklist-template.md](../assets/checklist-template.md), compare Figma value vs the computed style captured in Step 3.

Conversions / matching rules:
- Hex ↔ rgb: `#5252DC` ≡ `rgb(82, 82, 220)`.
- Font family: computed string must literally contain the expected family (e.g. `Inter`). Appearing only in the declared fallback list does NOT count.
- Font weight: compare numeric (400, 500, 600). If Figma applies weight to the entire string but code only wraps sub-spans in `<strong>`, that's a fail.
- Padding / border-radius: exact px match expected.
- Text content: normalize whitespace and compare case-insensitively if Figma uses `text-transform: capitalize` or similar.

After comparing, emit the checklist table and finalise with totals + bugs + business-confirmation items + evidence paths.
