# `priyomukul/wp-notice` library reference

Used by BetterLinks, BetterDocs, NotificationX, and most wpdeveloper.com plugins. Understanding its internals helps locate dismiss storage and AJAX hooks quickly.

## Key facts

- DOM wrapper ID pattern: `wpnotice-<app>-<notice_id>` where `<app>` is the plugin's app slug (e.g. `betterlinks`).
- Dismiss AJAX action: `<app>_wpnotice_dismiss_notice` (hooked via `add_action('wp_ajax_' . $this->hook, ...)`).
- Dismiss button class: `.dismiss-btn` (with `data-dismiss="true"`). Also responds to the native `.notice-dismiss` WP element.
- Nonce name: `wpnotice_dismiss_notice_<notice_id>`.
- Default dismiss scope: `user` → stored in `wp_usermeta` via `$this->app->storage()->save_meta($this->id)`.
- If scope is overridden to `site` → stored as site option `<app>_<notice_id>_notice_dismissed`.
- After dismiss, transient `wpnotice_priority_time_expired` is set for 10 hours (blocks notices queue re-evaluation).

## Notice registration

```php
$notices->add(
    'my_notice_id',                          // notice ID
    [ 'thumbnail' => ..., 'html' => ... ],   // content
    [
        'start'       => strtotime('...'),   // unix start
        'expire'      => strtotime('...'),   // unix end
        'recurrence'  => false,              // or int days for "maybe later"
        'dismissible' => true,
        'refresh'     => PLUGIN_VERSION,
        'display_if'  => ! is_plugin_active('plugin-pro/plugin-pro.php'),
        'priority'    => 7,
    ]
);

// Suppress on specific admin screens
self::$cache_bank->clear_notices_in_(
    [ 'toplevel_page_myplugin', 'myplugin_page_settings' ],
    $notices,
    true
);
```

## Storage locations to reset

| Scope | Table | Key |
|---|---|---|
| user (default) | `wp_usermeta` | meta_key `<app>_<notice_id>_notice_dismissed` |
| site | `wp_options` | option_name `<app>_<notice_id>_notice_dismissed` |
| priority queue | `wp_options` | `_transient_wpnotice_priority_time_expired` + `_transient_timeout_wpnotice_priority_time_expired` |
| notice registry | `wp_options` | `<app>_notices` (serialised array of registered notices) |

## Beware of dead code

Some plugins (e.g. BetterLinks) have a legacy `dismiss_black_friday_notice` AJAX handler that calls `update_site_option(...)` with the same key the library uses for scope=site. It's guarded by a different nonce and never fires in the live flow — don't be misled into thinking dismiss is site-wide when it's actually user-meta.

## `is_installed` vs `is_plugin_active` — a common Pro-hide bug

The library's helper `is_installed($plugin)` (in `Utils/Helper.php`) returns the plugin data **array** whenever the Pro folder exists in `wp-content/plugins/`, regardless of whether it's activated:

```php
public function is_installed( $plugin ) {
    $plugins = get_plugins();  // all installed plugins, active or not
    return isset( $plugins[ $plugin ] ) ? $plugins[ $plugin ] : false;
}
```

So these two `display_if` expressions behave very differently:

| Expression | Hides notice when Pro is… |
|---|---|
| `! is_plugin_active('plugin-pro/plugin-pro.php')` | …**active** only (correct) |
| `! is_array( $notices->is_installed('plugin-pro/plugin-pro.php') )` | …merely **installed** (bug — hides even when deactivated) |

**Impact on testing:** if the plugin uses the `is_installed` form, the Pro folder's mere presence will suppress the notice. Your Phase 1 run (Pro deactivated via UI) will show `present: false` and you'll wrongly conclude the notice never shows.

**Workaround in the skill:** when `display_if` uses `is_installed`, move the Pro folder out of `wp-content/plugins/` temporarily so WordPress can't see it:

```bash
mv "/path/to/wp-content/plugins/plugin-pro" /tmp/plugin-pro-backup
# run Playwright tests
mv /tmp/plugin-pro-backup "/path/to/wp-content/plugins/plugin-pro"
```

Report the `is_installed` form as a **confirmed bug** in the checklist — correct behaviour is to check activation, not installation.

## `screens` restriction

A notice registration can set `'screens' => ['dashboard']` to limit rendering to specific admin screens. `dashboard` is WordPress's screen ID for `/wp-admin/index.php` — NOT the plugin's own admin page. Plugin pages have IDs like `toplevel_page_<slug>` or `<slug>_page_<subpage>`.

When business spec says "show on <plugin> dashboard only", that usually means the plugin's toplevel admin page, which is the opposite of `screens => ['dashboard']`. Flag this as a divergence.
