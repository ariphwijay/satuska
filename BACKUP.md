# D1 Backup

Remote D1 database: `satuska-cms`

## Create a Backup

```bash
npm run backup:d1
```

The script writes a timestamped SQL export into `backups/`:

```txt
backups/d1-satuska-cms-YYYYMMDD_HHMMSS.sql
```

`backups/` is gitignored because exports can contain production content and submission data.

## Override Defaults

```bash
D1_DATABASE_NAME=satuska-cms D1_BACKUP_DIR=backups npm run backup:d1
```

## Verify a Backup File

```bash
ls -lh backups/d1-satuska-cms-*.sql
```

A valid backup should be non-empty and include schema/data SQL.

## Restore Note

Do not restore directly to production without first importing into a local or staging D1 database and checking the data. Use Cloudflare Wrangler D1 import tooling only after confirming the target database.
