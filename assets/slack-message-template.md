I have created a skill file to test the admin notice. For now it takes the CSS input (Figma MCP not wired yet). It needs the following info to start the test:

- Plugin slug + Pro plugin file name
- Local site URL + admin credentials
- Figma CSS (Dev Mode export of the notice frame + buttons + text)
- Body text (exact, with emojis)
- CTA label + expected CTA URL
- Campaign start + end dates
- Pages where the notice must appear
- Pages / conditions where it must be hidden (e.g. Pro active)
- Dismiss behavior per business spec (session / reload-resets / per-user / site-wide)
- Priority order vs other plugins (optional)
