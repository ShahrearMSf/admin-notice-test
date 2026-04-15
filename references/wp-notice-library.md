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
