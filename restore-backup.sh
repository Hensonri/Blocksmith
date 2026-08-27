#!/bin/sh
set -eu

website_output="BlocksmithWorks-Website-Complete-2026-08-27.zip"
online_output="Blocksmith-Online-Workshop-Source-2026-08-27-v18.zip"
website_sha="997039511bc9320e8487266e0f2254271dd3a7407100afe1bc7c77ea8e833f18"
online_sha="2607582eaaf586456b3b95d5cfbcdaf11a0c742d4a6bbd14e6b044d47046c940"

cat backup-parts/part-* > "$website_output"
cat online-workshop-parts-2026-08-27-v18/part-* > "$online_output"

printf 'Restored %s\n' "$website_output"
printf 'Restored %s\n' "$online_output"

if command -v sha256sum >/dev/null 2>&1; then
  printf '%s  %s\n' "$website_sha" "$website_output" | sha256sum -c -
  printf '%s  %s\n' "$online_sha" "$online_output" | sha256sum -c -
else
  printf 'Expected website SHA-256: %s\n' "$website_sha"
  printf 'Expected online source SHA-256: %s\n' "$online_sha"
fi
