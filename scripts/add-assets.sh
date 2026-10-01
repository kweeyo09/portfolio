#!/usr/bin/env bash
# Copy image/video files into client/public/assets using this project's naming
# convention: <slug>_<8-char content hash>.<ext>
#
# The hash matters: vercel.json serves /assets/* with
# `Cache-Control: immutable, max-age=31536000`, so a reused filename would be
# served stale for a year. Hashing the contents makes every revision a new URL.
#
# Usage:
#   bash scripts/add-assets.sh armani-01 ~/Desktop/shot1.jpg
#   bash scripts/add-assets.sh armani ~/Desktop/*.jpg      # auto-numbers them
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "usage: bash scripts/add-assets.sh <slug> <file> [file...]" >&2
  exit 1
fi

slug="$1"; shift
dest="$(cd "$(dirname "$0")/.." && pwd)/client/public/assets"
mkdir -p "$dest"

n=0
multi=0
[ "$#" -gt 1 ] && multi=1

for src in "$@"; do
  [ -f "$src" ] || { echo "skip (not a file): $src" >&2; continue; }
  n=$((n+1))
  ext="${src##*.}"
  ext="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"
  hash="$(sha256sum "$src" | cut -c1-8)"
  if [ "$multi" -eq 1 ]; then
    name="$(printf '%s-%02d_%s.%s' "$slug" "$n" "$hash" "$ext")"
  else
    name="$(printf '%s_%s.%s' "$slug" "$hash" "$ext")"
  fi
  cp "$src" "$dest/$name"
  echo "  { src: '/assets/$name', alt: '$slug $n' },"
done

echo
echo "Copied $n file(s) into client/public/assets" >&2
echo "Paste the lines above into the MEDIA array in the relevant page." >&2
