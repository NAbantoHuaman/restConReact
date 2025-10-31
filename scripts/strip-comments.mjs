import { promises as fs } from 'fs';
import path from 'path';
import strip from 'strip-comments';

const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip common build/output dirs
      if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
      out.push(...(await walk(full)));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.has(ext)) out.push(full);
    }
  }
  return out;
}

async function stripFile(file) {
  const original = await fs.readFile(file, 'utf8');

  // Preserve critical TypeScript directives that affect compilation semantics
  // - Triple-slash reference directives (e.g., /// <reference types="vite/client" />)
  // - ts directives (e.g., // @ts-nocheck, // @ts-ignore, // @ts-expect-error)
  const lines = original.split('\n');
  const preserved = [];
  const tokens = [];
  const preProcessed = lines
    .map((line) => {
      const isRef = /^\s*\/\/\/\s*<reference\s+.*\/>\s*$/.test(line);
      const isTsDirective = /^\s*\/\/\s*@ts-(nocheck|ignore|expect-error)\b/.test(line);
      if (isRef || isTsDirective) {
        const token = `__PRESERVE__${tokens.length}__`;
        tokens.push(token);
        preserved.push(line);
        return token;
      }
      return line;
    })
    .join('\n');

  const stripped = strip(preProcessed, { preserveNewlines: true });
  let restored = stripped;
  preserved.forEach((line, idx) => {
    const token = `__PRESERVE__${idx}__`;
    restored = restored.replace(token, line);
  });

  if (restored !== original) {
    await fs.writeFile(file, restored, 'utf8');
    return true;
  }
  return false;
}

async function main() {
  const roots = process.argv.slice(2);
  const baseDirs = roots.length ? roots : ['src'];
  let changed = 0;
  for (const base of baseDirs) {
    const dir = path.resolve(process.cwd(), base);
    const files = await walk(dir);
    for (const f of files) {
      const did = await stripFile(f);
      if (did) changed++;
    }
  }
  console.log(`Comentarios eliminados en ${changed} archivo(s).`);
}

main().catch((err) => {
  console.error('Error al eliminar comentarios:', err);
  process.exit(1);
});