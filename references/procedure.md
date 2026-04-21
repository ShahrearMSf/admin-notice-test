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

**Also test Pro-installed-but-inactive.** If the plugin's `display_if` uses `! is_array( ...is_installed(...) )` instead of `! is_plugin_active(...)`, the notice hides whenever the Pro folder exists — even deactivated. See [wp-notice-library.md](wp-notice-library.md). Test:

1. Deactivate Pro via plugins.php, keep the folder → visit must-show pages, record visibility.
2. If absent, confirm by moving folder: `mv "<plugins>/<plugin>-pro" /tmp/backup`, re-check, restore.
3. Add "Pro installed but INACTIVE" row in the checklist. Report `is_installed` as confirmed bug.

**Plugin toggle fallback:** Activating/deactivating via Playwright selectors can silently fail after multiple state changes. If plugin state doesn't match expectations, update `active_plugins` directly via mysql:
```bash
"$MYSQL" -u root -proot -S "$SOCK" local -e "SELECT option_value FROM wp_options WHERE option_name='active_plugins';"
# then UPDATE with corrected serialized array
```

## Step 5 — Priority check (only with `--priority`)

1. Activate all relevant plugins' free versions.
2. Reset each plugin's dismiss key.
3. **Move any Pro folders that trigger `is_installed` bugs** — otherwise those plugins' notices are hidden by folder presence, not priority.
4. Visit wp-admin dashboard.
5. Confirm only the highest-priority plugin's notice renders (priority order provided by the user).
6. Restore Pro folders afterward.

## Step 6 — Compare vs Figma + produce checklist

Parse the Figma CSS block the user pasted. For each property in [assets/checklist-template.md](../assets/checklist-template.md), compare Figma value vs the computed style captured in Step 3.

Conversions / matching rules:
- Hex ↔ rgb: `#5252DC` ≡ `rgb(82, 82, 220)`.
- Font family: computed string must literally contain the expected family (e.g. `Inter`). Appearing only in the declared fallback list does NOT count.
- Font weight: compare numeric (400, 500, 600). If Figma applies weight to the entire string but code only wraps sub-spans in `<strong>`, that's a fail.
- Font size: WP's `.notice p` defaults to 13px. If Figma says 14px and actual is 13px, the plugin needs an inline `font-size: 14px` on the paragraph — report as bug.
- Padding / border-radius: exact px match expected. Watch for WP's `.button` class overriding inline padding.
- Text content: normalize whitespace and compare. If Figma uses `text-transform: capitalize`, check whether the actual CSS applies the transform or the text is hardcoded in a different case. Visual-only comparison is not enough — note the implementation divergence.

After comparing, emit the checklist table and finalise with totals + bugs + business-confirmation items + evidence paths.
