# WP login automation quirks

## Password field ignores `page.fill()`

On some WP sites (confirmed on Local Lightning sites with stock `twentytwentyfive`), `page.fill('#user_pass', 'admin')` leaves the field empty and submission fails with "Please fill out this field". Root cause appears to be an autocomplete/password-manager JS handler on the input.

**Fix:** use `pressSequentially` with a small per-key delay.

```js
await page.goto(`${BASE}/wp-login.php`);
await page.waitForSelector('#user_pass');
await page.locator('#user_login').fill('admin');
await page.locator('#user_pass').click();
await page.locator('#user_pass').pressSequentially('admin', { delay: 50 });
await page.locator('#wp-submit').click();
await page.waitForURL(/wp-admin/);
```

## `waitForNavigation` times out

`page.waitForNavigation({ waitUntil: 'networkidle' })` often times out on WP admin pages because of long-polling heartbeats. Use `page.waitForURL(/wp-admin/)` after clicking submit instead.

## Storage state for reuse

After a successful login, save with `await context.storageState({ path: '/tmp/wp-auth.json' })` and reuse with `browser.newContext({ storageState: '/tmp/wp-auth.json' })` in subsequent scripts to avoid logging in every run.

## Local Lightning MySQL

System `mysql` command is usually missing. Use Local's bundled binary:

```
/Users/shahrear/Library/Application Support/Local/lightning-services/mysql-8.0.35+4/bin/darwin-arm64/bin/mysql
```

With the site-specific socket at `~/Library/Application Support/Local/run/<site-id>/mysql/mysqld.sock`. Find the right socket for your site:

```bash
find "$HOME/Library/Application Support/Local/run" -name mysqld.sock
```
