#!/usr/bin/env bash
# Grep a plugin for admin notice registration + dismiss wiring.
# Usage: ./discover-notice.sh <plugin-folder-path>
set -euo pipefail

PLUGIN_DIR="${1:?Usage: $0 <plugin-folder-path>}"

if [[ ! -d "$PLUGIN_DIR" ]]; then
  echo "Not a directory: $PLUGIN_DIR" >&2
  exit 1
fi

echo "== Notice registration (->add) =="
grep -rn --include='*.php' -E '\$notices->add\(|->notices->add\(' "$PLUGIN_DIR" || true

echo
echo "== Suppression (clear_notices_in_) =="
grep -rn --include='*.php' 'clear_notices_in_' "$PLUGIN_DIR" || true

echo
echo "== Dismiss hooks =="
grep -rn --include='*.php' -E 'wpnotice_dismiss|notice_dismissed|dismiss_.*notice' "$PLUGIN_DIR" || true

echo
echo "== display_if / priority / expire =="
grep -rn --include='*.php' -E "'display_if'|'priority'|'expire'|'start'" "$PLUGIN_DIR" | head -40 || true

echo
echo "== App slug (for DOM wrapper ID pattern wpnotice-<app>-<id>) =="
grep -rn --include='*.php' -E 'public \$app|->app\s*=|"app"\s*=>' "$PLUGIN_DIR" | head -10 || true
