import { cpSync, mkdirSync, readdirSync, statSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { dist } from "./config";

export function exists({ path }: { path: string }): boolean {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

export function isFile({ path }: { path: string }): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

export function walk({ dir }: { dir: string }): string[] {
  if (!exists({ path: dir })) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk({ dir: full }));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

export function writeHtml({ filePath, html }: { filePath: string; html: string }) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
}

export { cpSync };
