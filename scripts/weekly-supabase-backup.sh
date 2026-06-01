#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")
LOG_DIR="$PROJECT_ROOT/data/supabase-backups"
LOG_FILE="$LOG_DIR/weekly-backup.log"

mkdir -p "$LOG_DIR"
cd "$PROJECT_ROOT"

printf '%s Starting Supabase backup\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$LOG_FILE"
npm run supabase:export >> "$LOG_FILE" 2>&1
printf '%s Backup finished\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$LOG_FILE"
