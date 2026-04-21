# <PLUGIN_NAME> — Admin Notice QA Checklist

**Test date:** <YYYY-MM-DD> · **Window:** <START> → <END> · **Site:** <SITE_URL>

| # | Category | Item | Expected | Actual | Result |
|---|---|---|---|---|---|
| 1 | Design | Left border | `<expected>` | `<actual>` | ✅/❌/⚠️ |
| 2 | Design | Background | `<expected>` | `<actual>` | |
| 3 | Design | CTA button bg | `<expected>` | `<actual>` | |
| 4 | Design | CTA text color | `<expected>` | `<actual>` | |
| 5 | Design | CTA border-radius | `<expected>` | `<actual>` | |
| 6 | Design | CTA padding | `<expected>` | `<actual>` | |
| 7 | Design | CTA label | `<expected>` | `<actual>` | |
| 8 | Design | Dismiss color | `<expected>` | `<actual>` | |
| 9 | Design | Dismiss underline | yes | `<actual>` | |
| 10 | Design | Dismiss label | `<expected>` | `<actual>` | |
| 11 | Design | Body text content | `<expected>` | `<actual>` | |
| 12 | Design | `text-transform: capitalize` (if in Figma) | title-cased | `<actual — applied via CSS or hardcoded?>` | |
| 13 | Design | Font family | `<expected>` | `<actual>` | |
| 14 | Design | Body font size | `<expected>` | `<actual — watch for WP .notice p 13px override>` | |
| 15 | Design | Body line-height | `<expected>` | `<actual>` | |
| 16 | Design | Body font weight | `<expected>` | `<actual — full string or only <strong> spans?>` | |
| 16 | Design | CTA font size/weight | `<expected>` | `<actual>` | |
| 17 | Design | Dismiss font size/weight | `<expected>` | `<actual>` | |
| 18 | Visibility | <page 1> | visible | `<actual>` | |
| 19 | Visibility | <page 2> | visible | `<actual>` | |
| 20 | Visibility | <page 3> | visible | `<actual>` | |
| 21 | Visibility | Pro active — <page 1> | hidden | `<actual>` | |
| 22 | Visibility | Pro active — <page 2> | hidden | `<actual>` | |
| 23 | Visibility | Pro active — <page 3> | hidden | `<actual>` | |
| 24 | Visibility | Pro **installed but INACTIVE** | visible | `<actual — is_installed vs is_plugin_active?>` | |
| 24 | Behavior | CTA URL | `<expected>` | `<actual>` | |
| 25 | Behavior | CTA target=_blank | new tab | `<actual>` | |
| 26 | Behavior | Dismiss button dismisses | yes | `<actual>` | |
| 27 | Behavior | Dismiss AJAX | 200 OK | `<actual>` | |
| 28 | Behavior | Dismiss scope | `<expected>` | `<actual>` | |
| 29 | Behavior | Reappears after reload | `<expected>` | `<actual>` | |
| 30 | Behavior | Reappears in new session | `<expected>` | `<actual>` | |
| 31 | Schedule | Start date | `<expected>` | `<actual>` | |
| 32 | Schedule | End date | `<expected>` | `<actual>` | |
| 33 | Schedule | In-window → visible | yes | `<actual>` | |
| 34 | Schedule | Priority value | `<expected>` | `<actual>` | |

**Totals:** ✅ N · ❌ N · ⚠️ N

### Confirmed bugs
- <bullet>

### Needs business confirmation
- <bullet — where code diverges from user-stated spec, may be intentional>

### Evidence
- `/tmp/notice-<page>.png` (one per must-show page)
- `/tmp/pro-active-<page>.png` (one per must-show page, Pro active)
