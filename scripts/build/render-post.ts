import { escapeHtml } from "./html";
import { postPreview } from "./markdown";
import type { Post } from "./types";

function relatedPosts({ post, posts }: { post: Post; posts: Post[] }): string {
  const related = posts
    .filter((item) => item.author === post.author && item.authorRank > 0 && item.url !== post.url)
    .sort((a, b) => a.authorRank - b.authorRank);
  if (related.length === 0) return "";
  return `<ul class="post-list">${related.map((item) => postPreview({ post: item })).join("\n")}</ul>`;
}

export function renderPost({ post, posts }: { post: Post; posts: Post[] }): string {
  const tags = post.tags
    .map((tag) => `<span class="mr-1"><a href="/tags/${tag}">${escapeHtml({ value: tag })}</a></span>`)
    .join("");
  const showRelated = post.tags.includes("tails") || post.tags.includes("dev");
  return `<article class="post h-entry">
  <header class="post-header">
    <h1 class="post-title">${escapeHtml({ value: post.title })}</h1>
    <span class="post-meta"><span>${post.date}</span>${tags ? ` · ${tags}` : ""}</span>
  </header>
  <div class="post-content">${post.html}</div>
  ${showRelated ? relatedPosts({ post, posts }) : ""}
</article>`;
}
