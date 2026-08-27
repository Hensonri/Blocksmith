#!/bin/sh
set -eu

output="BlocksmithWorks-Website-Complete-2026-08-27.zip"
cat backup-parts/part-* > "$output"
printf 'Restored %s\n' "$output"
printf 'Expected SHA-256: 997039511bc9320e8487266e0f2254271dd3a7407100afe1bc7c77ea8e833f18\n'
