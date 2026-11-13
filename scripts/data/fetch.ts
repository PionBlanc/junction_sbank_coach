/**
 * Downloads the S-Pankki Junction 2026 dataset into data/raw/.
 * Skips files that are already present with the expected size.
 */
import { createWriteStream } from 'node:fs';
import { mkdir, open, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';

const REPO = 'hackjunction/Junction-2026-S-pankki';
const RAW_DIR = join(import.meta.dirname, '..', '..', 'data', 'raw');

const RAW_HOST = `https://raw.githubusercontent.com/${REPO}/main`;
// Git LFS files must come from the media host. The raw host only serves the pointer file.
const LFS_HOST = `https://media.githubusercontent.com/media/${REPO}/main`;

type RemoteFile = { name: string; url: string; bytes?: number };

const FILES: RemoteFile[] = [
  {
    name: 'tx_junction_transactions.csv',
    url: `${LFS_HOST}/tx_junction_transactions.csv`,
    bytes: 362_796_501,
  },
  { name: 'tx_customers_junction.csv', url: `${RAW_HOST}/tx_customers_junction.csv` },
  { name: 'mtg_negotiation_history.csv', url: `${RAW_HOST}/mtg_negotiation_history.csv` },
  {
    name: 'mtg_tx_customer_link_and_final_mtg_infio.csv',
    url: `${RAW_HOST}/mtg_tx_customer_link_and_final_mtg_infio.csv`,
  },
];

async function sizeOf(path: string): Promise<number | null> {
  try {
    return (await stat(path)).size;
  } catch {
    return null;
  }
}

async function assertNotLfsPointer(path: string): Promise<void> {
  const file = await open(path);
  try {
    const { buffer, bytesRead } = await file.read(Buffer.alloc(64), 0, 64, 0);
    if (buffer.subarray(0, bytesRead).toString('utf8').startsWith('version https://git-lfs')) {
      throw new Error(`${path} is a Git LFS pointer, not data. Delete it and run again.`);
    }
  } finally {
    await file.close();
  }
}

await mkdir(RAW_DIR, { recursive: true });

for (const file of FILES) {
  const path = join(RAW_DIR, file.name);
  const existing = await sizeOf(path);

  if (existing !== null && (file.bytes === undefined ? existing > 0 : existing === file.bytes)) {
    console.log(`ok       ${file.name} (already downloaded)`);
    continue;
  }

  console.log(`download ${file.name} ...`);
  const response = await fetch(file.url);
  if (!response.ok || !response.body) {
    throw new Error(`Download failed for ${file.url}: HTTP ${response.status}`);
  }
  await pipeline(Readable.fromWeb(response.body as WebReadableStream), createWriteStream(path));
  await assertNotLfsPointer(path);
  console.log(`ok       ${file.name} (${(((await sizeOf(path)) ?? 0) / 1e6).toFixed(1)} MB)`);
}
