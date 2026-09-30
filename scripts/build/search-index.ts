import { writeFileSync } from "fs";
import { join } from "path";
import { dist, root } from "./config";
import type { Post } from "./types";

export function writeSearchIndex({ posts }: { posts: Post[] }) {
  const index = posts.map((post) => ({
    title: post.title,
    url: post.url,
    description: post.description,
    date: post.date,
    tags: post.tags,
    text: post.searchText,
  }));
  writeFileSync(join(dist, "assets", "search-index.json"), JSON.stringify(index));
}

export async function bundleSearchClient() {
  const result = await Bun.build({
    entrypoints: [join(root, "scripts", "build", "client", "search.ts")],
    outdir: join(dist, "assets"),
    minify: true,
    target: "browser",
  });
  if (!result.success) {
    throw new Error(result.logs.map((log) => log.message).join("\n"));
  }
}
