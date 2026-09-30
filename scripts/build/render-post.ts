import { escapeHtml } from "./html";
import type { Post } from "./types";

export function renderPost({ post }: { post: Post }): string {
  const tags = post.tags
    .map((tag) => `<span class="mr-1"><a href="/tags/${tag}">${escapeHtml({ value: tag })}</a></span>`)
    .join("");
  return `<article class="post h-entry">
  <header class="post-header">
    <h1 class="post-title">${escapeHtml({ value: post.title })}</h1>
    <span class="post-meta"><span>${post.date}</span>${tags ? ` · ${tags}` : ""}</span>
  </header>
  <div class="post-content">${post.html}</div>
</article>`;
}
