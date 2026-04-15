# Worked example — BetterLinks Spring Campaign 2026

First real run of this skill. Use as sanity reference when re-running or extending to a new plugin.

## Inputs provided by the user

- Plugin slug: `betterlinks`
- Pro plugin file: `betterlinks-pro/betterlinks-pro.php`
- Site: `http://localhost:10048/wp-admin/` admin / admin
- Figma: Spring Campaign 2026, `node-id=257-1650`
- Body text: `🌸 Spring Savings: Get AI-powered features to manage, shorten & track every click – now Flat 25% OFF! ⚡️`
- CTA label: `Upgrade To Pro Now`
- CTA URL: `https://betterlinks.io/spring2026-admin-notice`
- Dismiss label: `Maybe Later` (acts as cross)
- Campaign window: 2026-04-08 → 2026-05-10
- Must-show: wp-admin dashboard, plugins.php, BetterLinks dashboard
- Must-hide: when BetterLinks Pro active
- Dismiss behavior per spec: session-based
- Priority: BetterDocs > BetterLinks > NotificationX

## Discovered in code (Step 0)

| Field | Value |
|---|---|
| Notice ID | `betterlinks_spring_camp_2026_deal` |
| DOM wrapper ID | `wpnotice-betterlinks-betterlinks_spring_camp_2026_deal` |
| Dismiss AJAX | `betterlinks_wpnotice_dismiss_notice` |
| Dismiss storage | User meta `betterlinks_betterlinks_spring_camp_2026_deal_notice_dismissed` (scope=user) |
| Source | `includes/Admin/Notice.php:361-381` |
| Suppressed on | `toplevel_page_betterlinks` + all BL subpages via `clear_notices_in_` (Notice.php:385-394) |
| Priority | 7 |

## Results checklist

| # | Category | Item | Expected | Actual | Result |
|---|---|---|---|---|---|
| 1 | Design | Left border | `3px solid #5252DC` | `3px solid #5252DC` | ✅ |
| 2 | Design | Background | `#FFFFFF` | `#FFFFFF` | ✅ |
| 3 | Design | CTA button bg | `#5252DC` | `rgb(82,82,220)` | ✅ |
| 4 | Design | CTA text color | `#FFFFFF` | `rgb(255,255,255)` | ✅ |
| 5 | Design | CTA border-radius | `6px` | `6px` | ✅ |
| 6 | Design | CTA padding | `8px 16px` | `0px 10px` (WP `.button` override) | ⚠️ |
| 7 | Design | CTA label | "Upgrade To Pro Now" | "Upgrade To Pro Now" | ✅ |
| 8 | Design | Dismiss color | `#424242` | `rgb(66,66,66)` | ✅ |
| 9 | Design | Dismiss underline | yes | yes | ✅ |
| 10 | Design | Dismiss label | "Maybe Later" | "Maybe Later" | ✅ |
| 11 | Design | Body text content | matches (incl. 🌸 ⚡️) | matches | ✅ |
| 12 | Design | Font family | `Inter` | system-ui fallback (Inter not loaded) | ❌ |
| 13 | Design | Body font size | 14px | 14px | ✅ |
| 14 | Design | Body line-height | 17px | 17px | ✅ |
| 15 | Design | Body font weight | 600 full string | 600 only on `<strong>` spans | ❌ |
| 16 | Design | CTA size/weight | 14px / 500 | 14px / 500 | ✅ |
| 17 | Design | Maybe Later size/weight | 14px / 400 | 14px / 400 | ✅ |
| 18 | Visibility | wp-admin dashboard | visible | visible | ✅ |
| 19 | Visibility | plugins.php | visible | visible | ✅ |
| 20 | Visibility | BetterLinks dashboard | visible (per spec) | absent (`clear_notices_in_`) | ⚠️ |
| 21 | Visibility | Pro active — dashboard | hidden | hidden | ✅ |
| 22 | Visibility | Pro active — plugins.php | hidden | hidden | ✅ |
| 23 | Visibility | Pro active — BL dashboard | hidden | hidden | ✅ |
| 24 | Behavior | CTA URL | expected | matches | ✅ |
| 25 | Behavior | CTA target=_blank | new tab | yes | ✅ |
| 26 | Behavior | Maybe Later dismisses | yes | yes | ✅ |
| 27 | Behavior | Dismiss AJAX | 200 OK | 200 OK | ✅ |
| 28 | Behavior | Dismiss scope | session | user-meta persistent | ❌ |
| 29 | Behavior | Reappears after reload | yes | no | ❌ |
| 30 | Behavior | Reappears in new session | yes | no | ❌ |
| 31 | Schedule | Start date | 2026-04-08 | matches | ✅ |
| 32 | Schedule | End date | 2026-05-10 | matches | ✅ |
| 33 | Schedule | In-window → visible | yes | yes | ✅ |
| 34 | Schedule | Priority value | 7 | 7 | ✅ |

**Totals:** ✅ 27 · ❌ 5 · ⚠️ 2

### Confirmed bugs
- `Inter` font never enqueued — system fallback renders.
- Body weight 600 applied only to `<strong>` spans, not full string.
- Dismiss persists across reload + new session (tied: #28, #29, #30).

### Needs business confirmation
- CTA padding `0px 10px` vs Figma `8px 16px` (WP `.button` override).
- Notice suppressed on BetterLinks dashboard via `clear_notices_in_` while spec says must-show.
