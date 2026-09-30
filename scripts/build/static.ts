import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { dist, root } from "./config";
import { cpSync, exists, isFile } from "./fs";
import type { Post } from "./types";

export function copyPostAssets({ post }: { post: Post }) {
  if (!post.assets.length || !post.url.startsWith("/")) return;
  const outDir = join(dist, post.url.slice(1));
  for (const name of post.assets) {
    const dest = join(outDir, name);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(join(post.dir, name), dest);
  }
}

export function copyStatic() {
  const assetDir = join(root, "assets");
  if (exists({ path: assetDir })) cpSync(assetDir, join(dist, "assets"), { recursive: true });
  const games = join(root, "@adam");
  if (exists({ path: games })) cpSync(games, join(dist, "@adam"), { recursive: true });

  const rootFiles = [
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "apple-touch-icon.png",
    "browserconfig.xml",
    "CNAME",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "favicon.ico",
    "mstile-150x150.png",
    "safari-pinned-tab.svg",
    "site.webmanifest",
  ];
  for (const name of rootFiles) {
    const source = join(root, name);
    if (isFile({ path: source })) cpSync(source, join(dist, name));
  }

  cpSync(join(root, "styles", "site.css"), join(dist, "assets", "site.css"));
  const highlightCss = join(root, "node_modules", "highlight.js", "styles", "github.min.css");
  if (isFile({ path: highlightCss })) cpSync(highlightCss, join(dist, "assets", "highlight.css"));
}
