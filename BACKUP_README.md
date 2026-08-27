# BlocksmithWorks.com Complete Backup — 2026-08-27

This branch is a non-deployment backup of the production BlocksmithWorks.com website at Site source commit `1e5a6c2c81036958033352e42a28e440989dba41`.

The restored ZIP contains the complete tracked website source and the public offline package at:

`BlocksmithWorks-Website/public/downloads/Blocksmith-Works.zip`

## Restore

On Linux or macOS, run:

```sh
sh restore-backup.sh
```

On Windows PowerShell, combine the numbered files in binary order, or use Git Bash to run the same script.

## Verification

- Complete website backup ZIP: `997039511bc9320e8487266e0f2254271dd3a7407100afe1bc7c77ea8e833f18`
- Offline V1.0.6 ZIP inside the backup: `4722610e427c0f43a43784a1a2cb6f67d45fc8a5c38a3024b687dbc1d03961b9`
- Complete backup size: `33,389,850` bytes

The numbered parts are raw binary segments, not individual ZIP files. They must be combined in filename order before opening the archive.
