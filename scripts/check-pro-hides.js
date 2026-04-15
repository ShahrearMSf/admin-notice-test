// Verify that activating a plugin's Pro version hides the promo notice.
// Run with: CONFIG=/tmp/notice-config.json node check-pro-hides.js
//
// Requires these extra fields in the config JSON on top of inspect-notice.js:
//   "proPluginSlug": "betterlinks-pro"

const fs = require('fs');
const { chromium } = require('playwright');

const cfg = JSON.parse(fs.readFileSync(process.env.CONFIG || '/tmp/notice-config.json', 'utf8'));
const BASE = cfg.baseUrl.replace(/\/$/, '');

async function login(page) {
  await page.goto(`${BASE}/wp-login.php`);
  await page.waitForSelector('#user_pass');
  await page.locator('#user_login').fill(cfg.user);
  await page.locator('#user_pass').click();
  await page.locator('#user_pass').pressSequentially(cfg.pass, { delay: 50 });
  await page.locator('#wp-submit').click();
  await page.waitForURL(/wp-admin/);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await login(page);

  // Activate Pro
  await page.goto(`${BASE}/wp-admin/plugins.php`);
  await page.waitForLoadState('networkidle');
  const activateLink = page.locator(`tr[data-slug="${cfg.proPluginSlug}"] .activate a`).first();
  if (await activateLink.count()) {
    console.log(`Activating ${cfg.proPluginSlug}...`);
    await activateLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  } else {
    console.log(`${cfg.proPluginSlug} already active (or row not found).`);
  }

  const results = [];
  for (const p of cfg.pages) {
    await page.goto(`${BASE}${p.url}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const state = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return { present: !!el, visible: el ? el.offsetParent !== null : false };
    }, cfg.noticeDomId);
    await page.screenshot({ path: `/tmp/pro-active-${p.name}.png`, fullPage: true });
    results.push({ page: p.name, ...state });
  }
  console.log('PRO_ACTIVE_RESULTS:', JSON.stringify(results, null, 2));

  // Deactivate Pro again to restore clean state
  await page.goto(`${BASE}/wp-admin/plugins.php`);
  await page.waitForLoadState('networkidle');
  const deactivateLink = page.locator(`tr[data-slug="${cfg.proPluginSlug}"] .deactivate a`).first();
  if (await deactivateLink.count()) {
    await deactivateLink.click();
    await page.waitForLoadState('networkidle');
    console.log(`Deactivated ${cfg.proPluginSlug}.`);
  }

  await browser.close();
})();
