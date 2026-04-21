# Worked example — NotificationX Spring Campaign 2026

Second run of this skill. Surfaced the `is_installed` vs `is_plugin_active` bug pattern.

## Inputs

- Plugin slug: `notificationx`
- Pro plugin file: `notificationx-pro/notificationx-pro.php`
- Site: `http://localhost:10048/wp-admin/` admin / admin
- Body text: `🌸 Spring Savings: Boost conversions with real-time social proof & AI-powered notification alerts – now Flat 25% OFF! ⚡️`
- CTA: "Upgrade To Pro Now" → `https://notificationx.com/spring2026-admin-notice`
- Dismiss: "Maybe Later"
- Campaign: 2026-04-08 → 2026-05-10
- Must-show per user spec: NotificationX dashboard only
- Must-hide: when NX Pro active
- Dismiss behavior per spec: session-based
- Priority: BetterLinks > NotificationX

## Discovered in code (Step 0)

| Field | Value |
|---|---|
| Source | `includes/Admin/Admin.php:370-381` |
| Notice ID | `nx_spring_deal_2026` |
| App slug | `notificationx` |
| DOM wrapper ID | `wpnotice-notificationx-nx_spring_deal_2026` |
| `display_if` | `!is_array($notices->is_installed('notificationx-pro/notificationx-pro.php'))` |
| `screens` | `['dashboard']` (WP admin home, NOT the NX admin page) |
| Priority | not set (library default) |
| Start | `strtotime('12:00:00am 8th April, 2026')` |
| Expire | `strtotime('11:59:59pm 10th May, 2026')` |
| Dismiss storage | User meta `notificationx_nx_spring_deal_2026_notice_dismissed` (scope=user) |

## Results checklist

| # | Category | Item | Expected | Actual | Result |
|---|---|---|---|---|---|
| 1 | Design | Left border | `3px solid #5252DC` | `3px solid rgb(82,82,220)` | ✅ |
| 2 | Design | Background | `#FFFFFF` | `rgb(255,255,255)` | ✅ |
| 3 | Design | CTA button bg | `#5252DC` | `rgb(82,82,220)` | ✅ |
| 4 | Design | CTA text color | `#FFFFFF` | `rgb(255,255,255)` | ✅ |
| 5 | Design | CTA border-radius | `6px` | `6px` | ✅ |
| 6 | Design | CTA padding | `8px 16px` | `8px 16px` | ✅ |
| 7 | Design | CTA label | "Upgrade To Pro Now" | "Upgrade To Pro Now" | ✅ |
| 8 | Design | Dismiss color | `#424242` | `rgb(66,66,66)` | ✅ |
| 9 | Design | Dismiss underline | yes | yes | ✅ |
| 10 | Design | Dismiss label | "Maybe Later" | "Maybe Later" | ✅ |
| 11 | Design | Body text content | matches (with 🌸 ⚡️) | matches | ✅ |
| 12 | Design | `text-transform: capitalize` | every word title-cased | not applied (sentence case) | ❌ |
| 13 | Design | Font family | `Inter` | system-ui fallback | ❌ |
| 14 | Design | Body font size | 14px | 13px (WP `.notice p` override) | ❌ |
| 15 | Design | Body font weight | 600 full string | 400 (bold only `<strong>` spans) | ❌ |
| 16 | Design | Body line-height | 17px | inherited from `.notice` | ⚠️ |
| 17 | Design | CTA size/weight | 14px / 500 | 14px / 500 | ✅ |
| 18 | Design | Maybe Later size/weight | 14px / 400 | 14px / 400 | ✅ |
| 19 | Visibility | WP admin dashboard | visible | visible | ✅ |
| 20 | Visibility | plugins.php | per `screens=['dashboard']` | not visible | ✅ |
| 21 | Visibility | NX admin dashboard (`?page=nx-admin`) | visible (per user spec) | not visible | ❌ |
| 22 | Visibility | NX Settings | not visible | not visible | ✅ |
| 23 | Visibility | NX Pro active — WP dashboard | hidden | hidden | ✅ |
| 24 | Visibility | NX Pro **installed but INACTIVE** | visible | hidden (`is_installed` bug) | ❌ |
| 25 | Behavior | CTA URL | `https://notificationx.com/spring2026-admin-notice` | same | ✅ |
| 26 | Behavior | CTA `target="_blank"` | new tab | `target="_blank"` | ✅ |
| 27 | Schedule | Start date | 2026-04-08 | matches | ✅ |
| 28 | Schedule | End date | 2026-05-10 | matches (11:59:59pm) | ✅ |
| 29 | Schedule | In-window → visible | yes | yes (with Pro folder removed) | ✅ |
| 30 | Schedule | Priority value | explicit numeric | not set (library default) | ⚠️ |
| 31 | Priority | BL + NX free on WP dashboard | BL wins (per spec) | only BL renders | ✅ |

**Totals:** ✅ 22 · ❌ 6 · ⚠️ 2

### Confirmed bugs
- `is_installed` used instead of `is_plugin_active` — notice hidden when Pro folder exists even if deactivated.
- `Inter` font not enqueued.
- Body font size 13px (WP default for `.notice p`) — needs inline `font-size: 14px`.
- Body weight 600 only on `<strong>` spans.
- `text-transform: capitalize` from Figma not applied in CSS.

### Needs business confirmation
- **Visibility target**: user spec says "NX dashboard only" but code uses `screens => ['dashboard']` which is WP admin home — not `toplevel_page_nx-admin`.
- **No explicit priority value** — BL wins on WP dashboard, matching stated order, but relying on library default ordering.

### Testing notes
- NX Pro folder must be physically removed to see the notice. Simply deactivating Pro via plugins.php is not enough due to the `is_installed` bug.
- Plugin activate/deactivate via Playwright selectors can silently fail after rapid state changes. Fallback: update `active_plugins` option directly via mysql.
