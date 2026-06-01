#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const TABLES = [
  { name: 'site_settings', conflictKey: 'key', orderBy: 'key' },
  { name: 'products', conflictKey: 'id', orderBy: 'created_at' },
  { name: 'orders', conflictKey: 'id', orderBy: 'created_at' },
  { name: 'customers', conflictKey: 'id', orderBy: 'created_at' },
  { name: 'stock', conflictKey: 'id', orderBy: 'created_at' },
  { name: 'fournisseurs', conflictKey: 'id', orderBy: 'created_at' },
  { name: 'paiements', conflictKey: 'id', orderBy: 'created_at' },
  { name: 'pending_reviews', conflictKey: 'id', orderBy: 'created_at' },
  { name: 'admin_roles', conflictKey: 'user_id', orderBy: 'created_at' },
];

const STORAGE_BUCKETS = [
  { name: 'site-images' },
];

async function readEnvFileIfNeeded() {
  const envPath = path.join(projectRoot, '.env.local');
  try {
    const text = await fs.readFile(envPath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const eqIndex = trimmed.indexOf('=');
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key] && value) process.env[key] = value;
    }
  } catch {
    // No local env file present; rely on the shell environment.
  }
}

function getArgValue(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function getErrorMessage(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object') {
    const maybe = error.message ?? error.error ?? error.details ?? error.hint;
    if (typeof maybe === 'string') return maybe;
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

function shouldSkipMissingTable(error) {
  const message = getErrorMessage(error).toLowerCase();
  const code = typeof error === 'object' && error ? String(error.code ?? '') : '';
  const status = typeof error === 'object' && error ? Number(error.status ?? 0) : 0;
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    status === 404 ||
    message.includes('does not exist') ||
    message.includes('not found') ||
    message.includes('relation') && message.includes('does not exist')
  );
}

function nowStamp() {
  return new Date().toISOString().replaceAll(':', '-').replace('T', '_').replace(/\.\d{3}Z$/, 'Z');
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function joinPosix(...parts) {
  return parts.filter(Boolean).join('/').replace(/\/+/g, '/');
}

async function walkFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function fetchAllRows(supabase, tableName, orderBy) {
  const pageSize = 1000;
  const rows = [];
  let offset = 0;

  while (true) {
    let query = supabase.from(tableName).select('*').range(offset, offset + pageSize - 1);
    if (orderBy) query = query.order(orderBy, { ascending: true });

    let { data, error } = await query;
    if (error && orderBy && /column .* does not exist|could not find the relation/i.test(error.message)) {
      ({ data, error } = await supabase.from(tableName).select('*').range(offset, offset + pageSize - 1));
    }
    if (error) throw error;

    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < pageSize) break;
    offset += pageSize;
  }

  return rows;
}

async function exportTables(supabase, outDir) {
  await ensureDir(outDir);

  const manifest = {
    generated_at: new Date().toISOString(),
    source: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    tables: [],
    storage: [],
  };

  for (const table of TABLES) {
    try {
      const rows = await fetchAllRows(supabase, table.name, table.orderBy);
      const filePath = path.join(outDir, `${table.name}.json`);
      await fs.writeFile(filePath, JSON.stringify(rows, null, 2));
      manifest.tables.push({
        name: table.name,
        rows: rows.length,
        conflict_key: table.conflictKey,
        file: `${table.name}.json`,
      });
      process.stdout.write(`Exported ${table.name}: ${rows.length} rows\n`);
    } catch (error) {
      if (shouldSkipMissingTable(error)) {
        process.stdout.write(`Skipped ${table.name}: table not found\n`);
        continue;
      }
      const message = getErrorMessage(error);
      throw new Error(`Export failed for ${table.name}: ${message}`);
    }
  }

  await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}

async function exportStorageBucket(supabase, bucketName, outDir) {
  const bucketDir = path.join(outDir, 'storage', bucketName);
  let exportedCount = 0;

  async function walkAndDownload(prefix = '') {
    const { data, error } = await supabase.storage.from(bucketName).list(prefix, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw error;

    const items = data ?? [];
    for (const item of items) {
      const remotePath = joinPosix(prefix, item.name);
      if (item.metadata === null && !item.id) {
        await walkAndDownload(remotePath);
        continue;
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucketName)
        .download(remotePath);
      if (downloadError) throw downloadError;

      const localFilePath = path.join(bucketDir, remotePath);
      await ensureDir(path.dirname(localFilePath));
      const arrayBuffer = await fileData.arrayBuffer();
      await fs.writeFile(localFilePath, Buffer.from(arrayBuffer));
      exportedCount += 1;
      process.stdout.write(`Exported ${bucketName}/${remotePath}\n`);
    }
  }

  await walkAndDownload('');
  return { bucket: bucketName, files: exportedCount };
}

async function importStorageBucket(supabase, bucketName, inDir, { dryRun = false } = {}) {
  const bucketDir = path.join(inDir, 'storage', bucketName);
  const exists = await fs.access(bucketDir).then(() => true).catch(() => false);
  if (!exists) return { bucket: bucketName, files: 0 };

  const files = await walkFiles(bucketDir);
  let importedCount = 0;

  for (const fullPath of files) {
    const relativePath = path.relative(bucketDir, fullPath).split(path.sep).join('/');
    if (dryRun) {
      process.stdout.write(`Dry run storage ${bucketName}/${relativePath}\n`);
      importedCount += 1;
      continue;
    }

    const bytes = await fs.readFile(fullPath);
    const { error } = await supabase.storage.from(bucketName).upload(relativePath, bytes, {
      upsert: true,
      cacheControl: '3600',
    });
    if (error) throw new Error(`Import failed for storage ${bucketName}/${relativePath}: ${error.message}`);

    importedCount += 1;
    process.stdout.write(`Imported storage ${bucketName}/${relativePath}\n`);
  }

  return { bucket: bucketName, files: importedCount };
}

async function importTables(supabase, inDir, { dryRun = false } = {}) {
  const manifestPath = path.join(inDir, 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const results = [];

  for (const table of manifest.tables ?? []) {
    const filePath = path.join(inDir, table.file ?? `${table.name}.json`);
    const rows = JSON.parse(await fs.readFile(filePath, 'utf8'));

    if (dryRun) {
      results.push({ name: table.name, rows: rows.length, dryRun: true });
      process.stdout.write(`Dry run ${table.name}: ${rows.length} rows\n`);
      continue;
    }

    if (!rows.length) {
      results.push({ name: table.name, rows: 0 });
      continue;
    }

    const conflictKey = table.conflict_key;
    if (!conflictKey) {
      throw new Error(`Missing conflict key for ${table.name}`);
    }

    const { error } = await supabase.from(table.name).upsert(rows, { onConflict: conflictKey });
    if (error) throw new Error(`Import failed for ${table.name}: ${error.message}`);

    results.push({ name: table.name, rows: rows.length });
    process.stdout.write(`Imported ${table.name}: ${rows.length} rows\n`);
  }

  for (const bucket of manifest.storage ?? []) {
    const result = await importStorageBucket(supabase, bucket.bucket, inDir, { dryRun });
    results.push({ name: `storage:${bucket.bucket}`, files: result.files, dryRun });
  }

  return results;
}

async function main() {
  await readEnvFileIfNeeded();

  const command = process.argv[2] ?? 'export';
  const outDirArg = getArgValue('--out');
  const inDirArg = getArgValue('--in');
  const dryRun = hasFlag('--dry-run');

  if (command === '--help' || command === '-h') {
    process.stdout.write([
      'Usage:',
      '  node scripts/supabase-backup.mjs export [--out <dir>]',
      '  node scripts/supabase-backup.mjs import --in <dir> [--dry-run]',
      '',
      'Environment:',
      '  NEXT_PUBLIC_SUPABASE_URL',
      '  SUPABASE_SERVICE_ROLE_KEY',
    ].join('\n'));
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
  }
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (command === 'export') {
    const outDir = outDirArg ?? path.join(projectRoot, 'data', 'supabase-backups', nowStamp());
    const manifest = await exportTables(supabase, outDir);
    for (const bucket of STORAGE_BUCKETS) {
      try {
        const result = await exportStorageBucket(supabase, bucket.name, outDir);
        manifest.storage.push(result);
      } catch (error) {
        if (shouldSkipMissingTable(error)) {
          process.stdout.write(`Skipped bucket ${bucket.name}: bucket not found\n`);
          continue;
        }
        const message = getErrorMessage(error);
        throw new Error(`Export failed for bucket ${bucket.name}: ${message}`);
      }
    }
    await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    process.stdout.write(`Backup written to ${outDir}\n`);
    process.stdout.write(`Manifest: ${manifest.tables.length} tables\n`);
    return;
  }

  if (command === 'import') {
    const inDir = inDirArg;
    if (!inDir) throw new Error('Missing --in <directory>');
    const results = await importTables(supabase, inDir, { dryRun });
    process.stdout.write(`Imported ${results.length} tables\n`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
