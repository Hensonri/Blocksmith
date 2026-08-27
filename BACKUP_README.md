# Blocksmith Works Complete Backup — 2026-08-27 — Online Workshop v18

This is the dated **latest-and-greatest** Blocksmith Works backup created after Online Workshop version 18 was published on 2026-08-27.

Backup branch:

`backup/blocksmithworks-complete-2026-08-27-v18`

## Included

1. **Complete BlocksmithWorks.com website backup**
   - Restored filename: `BlocksmithWorks-Website-Complete-2026-08-27.zip`
   - Production website source commit recorded by the original backup: `1e5a6c2c81036958033352e42a28e440989dba41`
   - Includes the public V1.0.6 offline download at:
     `BlocksmithWorks-Website/public/downloads/Blocksmith-Works.zip`

2. **Published Blocksmith Online Workshop v18 source**
   - Restored filename: `Blocksmith-Online-Workshop-Source-2026-08-27-v18.zip`
   - Published Sites source commit: `1c29fd014d6c97e131343c6775349a5a4f3c0ac6`
   - Live URL: https://blocksmith-online.jack-b-nimble.chatgpt.site
   - Includes the approved initial-release rounded-open crown profile, full-scale STL export, true-round geometry, and five governed bottom sockets.

## Restore

On Linux or macOS, run:

```sh
sh restore-backup.sh
```

On Windows, run the same script in Git Bash, or combine each numbered part folder in binary filename order.

The script reconstructs both dated ZIP files and verifies them when `sha256sum` is available.

## Verification

| Artifact | Size | SHA-256 |
|---|---:|---|
| `BlocksmithWorks-Website-Complete-2026-08-27.zip` | 33,389,850 bytes | `997039511bc9320e8487266e0f2254271dd3a7407100afe1bc7c77ea8e833f18` |
| `Blocksmith-Online-Workshop-Source-2026-08-27-v18.zip` | 1,258,217 bytes | `2607582eaaf586456b3b95d5cfbcdaf11a0c742d4a6bbd14e6b044d47046c940` |
| Offline V1.0.6 ZIP inside the website backup | — | `4722610e427c0f43a43784a1a2cb6f67d45fc8a5c38a3024b687dbc1d03961b9` |

The numbered files are raw binary segments, not individual ZIP files. They must be combined in filename order before opening the archives.

## Naming rule for future backups

Use:

`backup/blocksmithworks-complete-YYYY-MM-DD-vNN`

and:

`Blocksmith-Online-Workshop-Source-YYYY-MM-DD-vNN.zip`

The date and published version make the newest complete backup easy to identify without replacing older restore points.
