#!/usr/bin/env node
import { mkdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const dbName = process.env.D1_DATABASE_NAME || 'satuska-cms';
const backupDir = process.env.D1_BACKUP_DIR || 'backups';
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, '').replace('T', '_');
const output = path.join(backupDir, `d1-${dbName}-${stamp}.sql`);

await mkdir(backupDir, { recursive: true });

const args = ['wrangler', 'd1', 'export', dbName, '--remote', '--output', output, '--skip-confirmation'];
const result = spawnSync('npx', args, { stdio: 'inherit' });
if (result.status !== 0) {
	process.exit(result.status ?? 1);
}

const file = await stat(output);
if (file.size === 0) {
	console.error(`Backup file is empty: ${output}`);
	process.exit(1);
}

console.log(`D1 backup written: ${output}`);
console.log(`Size: ${file.size} bytes`);
