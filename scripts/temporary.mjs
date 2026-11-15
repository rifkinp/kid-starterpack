import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const temporaryRoot = path.resolve(process.env.KID_VERIFY_TMPDIR || os.tmpdir());

export function createTemporary(prefix) {
  fs.mkdirSync(temporaryRoot, { recursive: true });
  return fs.mkdtempSync(path.join(temporaryRoot, prefix));
}

export function removeTemporary(directory) {
  const target = path.resolve(directory);
  if (!target.startsWith(temporaryRoot + path.sep) || !path.basename(target).startsWith('kid-')) {
    throw new Error('Unsafe cleanup path');
  }
  fs.rmSync(target, { recursive: true, force: true });
}
