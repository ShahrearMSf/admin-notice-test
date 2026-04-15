#!/usr/bin/env bash
# Reset admin-notice dismiss state via direct DB.
# Usage:
#   ./reset-dismiss.sh user-meta   <meta_key>
#   ./reset-dismiss.sh site-option <option_name>
#   ./reset-dismiss.sh transient   <transient_key>
#
# Env overrides:
#   MYSQL   — path to mysql binary (default = Local Lightning's)
#   SOCK    — mysql socket path (default = first match under Local's run dir)
#   DB      — database name (default: local)
#   DB_USER — (default: root)
#   DB_PASS — (default: root)
set -euo pipefail

SCOPE="${1:?Usage: $0 <user-meta|site-option|transient> <key>}"
KEY="${2:?Usage: $0 <user-meta|site-option|transient> <key>}"

MYSQL_BIN="${MYSQL:-/Users/shahrear/Library/Application Support/Local/lightning-services/mysql-8.0.35+4/bin/darwin-arm64/bin/mysql}"
SOCK_PATH="${SOCK:-$(find "$HOME/Library/Application Support/Local/run" -name mysqld.sock 2>/dev/null | head -1)}"
DB="${DB:-local}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-root}"

if [[ -z "$SOCK_PATH" ]]; then
  echo "Could not locate Local Lightning mysql socket. Set SOCK=... to override." >&2
  exit 1
fi

run_sql() {
  "$MYSQL_BIN" -u "$DB_USER" -p"$DB_PASS" -S "$SOCK_PATH" "$DB" -Nse "$1"
}

case "$SCOPE" in
  user-meta)
    run_sql "DELETE FROM wp_usermeta WHERE meta_key='$KEY'; SELECT 'deleted user_meta rows:', ROW_COUNT();"
    ;;
  site-option)
    run_sql "DELETE FROM wp_options WHERE option_name='$KEY'; SELECT 'deleted option rows:', ROW_COUNT();"
    ;;
  transient)
    run_sql "DELETE FROM wp_options WHERE option_name='_transient_$KEY' OR option_name='_transient_timeout_$KEY'; SELECT 'deleted transient rows:', ROW_COUNT();"
    ;;
  *)
    echo "Unknown scope: $SCOPE (expected user-meta|site-option|transient)" >&2
    exit 1
    ;;
esac
