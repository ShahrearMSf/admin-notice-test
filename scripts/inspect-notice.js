// Playwright inspection for a plugin's admin promo notice.
// Requires: playwright in node_modules (reuse ../BetterLinks-E2E-Test).
// Run with: CONFIG=/tmp/notice-config.json node inspect-notice.js
//
// Config JSON shape:
// {
//   "baseUrl": "http://localhost:10048",
//   "user": "admin",
//   "pass": "admin",
//   "noticeDomId": "wpnotice-<app>-<id>",
//   "pages": [
//     { "name": "dashboard", "url": "/wp-admin/index.php", "mustShow": true },
//     { "name": "plugins",   "url": "/wp-admin/plugins.php", "mustShow": true },
//     { "name": "plugin-home","url": "/wp-admin/admin.php?page=<slug>", "mustShow": true }
//   ],
//   "dismissButtonTextRegex": "^(Maybe Later|Dismiss)$"
// }

const fs = require('fs');
const { chromium } = require('playwright');

const CONFIG_PATH = process.env.CONFIG || '/tmp/notice-config.json';
const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const BASE = cfg.baseUrl.replace(/\/$/, '');
const DISMISS_RX = new RegExp(cfg.dismissButtonTextRegex || '^(Maybe Later|Dismiss)$', 'i');

async function login(page) {
  await page.goto(`${BASE}/wp-login.php`);
  await page.waitForSelector('#user_pass');
  await page.locator('#user_login').fill(cfg.user);
  await page.locator('#user_pass').click();
  await page.locator('#user_pass').pressSequentially(cfg.pass, { delay: 50 });
  await page.locator('#wp-submit').click();
  await page.waitForURL(/wp-admin/);
}

async function probe(page, id) {
  return page.evaluate((noticeId) => {
    const el = document.getElementById(noticeId);
    if (!el) return { present: false };
    const btn = el.querySelector('a.button-primary, a[class*="button-primary"], a[class*="button"]:not([class*="dismiss"])');
    const dismiss = el.querySelector('a.dismiss-btn, [data-dismiss], .notice-dismiss');
    const cs = getComputedStyle(el);
    const pick = (node) => node ? {
      label: (node.innerText || '').trim(),
      href: node.href || null,
      target: node.target || null,
      bg: getComputedStyle(node).backgroundColor,
      color: getComputedStyle(node).color,
      radius: getComputedStyle(node).borderRadius,
      padding: getComputedStyle(node).padding,
      fontSize: getComputedStyle(node).fontSize,
      fontWeight: getComputedStyle(node).fontWeight,
      fontFamily: getComputedStyle(node).fontFamily,
      textDecoration: getComputedStyle(node).textDecorationLine,
    } : null;
    return {
      present: true,
      visible: el.offsetParent !== null,
      wrapper: {
        borderLeft: cs.borderLeft,
        bg: cs.backgroundColor,
        fontFamily: cs.fontFamily,
      },
      text: (el.innerText || '').replace(/\s+/g, ' ').trim(),
      cta: pick(btn),
      dismiss: pick(dismiss),
    };
  }, id);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();

  const ajax = [];
  page.on('request', r => {
    if (r.method() === 'POST' && /admin-ajax/.test(r.url())) ajax.push(r.postData());
  });

  await login(page);

  const results = [];
  for (const p of cfg.pages) {
    await page.goto(`${BASE}${p.url}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const data = await probe(page, cfg.noticeDomId);
    await page.screenshot({ path: `/tmp/notice-${p.name}.png`, fullPage: true });
    results.push({ page: p.name, url: p.url, mustShow: p.mustShow, data });
  }
  console.log('PAGE_RESULTS:', JSON.stringify(results, null, 2));

  // Dismiss test (only if at least one page showed the notice)
  const firstVisible = results.find(r => r.data?.present && r.data?.visible);
  if (firstVisible) {
    await page.goto(`${BASE}${firstVisible.url}`);
    await page.waitForLoadState('networkidle');
    const btn = page.locator('a,button').filter({ hasText: DISMISS_RX }).first();
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(1500);
    }
    await page.reload();
    await page.waitForLoadState('networkidle');
    const afterReload = await page.evaluate((id) => !!document.getElementById(id), cfg.noticeDomId);
    console.log('PRESENT_AFTER_RELOAD:', afterReload);

    const fresh = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    const fp = await fresh.newPage();
    await login(fp);
    await fp.goto(`${BASE}${firstVisible.url}`);
    await fp.waitForLoadState('networkidle');
    const afterFresh = await fp.evaluate((id) => !!document.getElementById(id), cfg.noticeDomId);
    console.log('PRESENT_IN_FRESH_SESSION:', afterFresh);
  } else {
    console.log('Notice not visible on any page — skipping dismiss test.');
  }

  console.log('AJAX_DISMISS_CALLS:', JSON.stringify(ajax.filter(x => /dismiss/i.test(x || '')), null, 2));
  await browser.close();
})();
