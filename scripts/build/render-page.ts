import { postsForPage } from "./content";
import { escapeHtml } from "./html";
import { postPreview } from "./markdown";
import type { Page, Post } from "./types";

export function renderPageBody({ page, posts }: { page: Page; posts: Post[] }): string {
  if (page.layout === "default") return page.html;

  if (page.layout === "home") {
    const title = page.title ? `<h1 class="page-heading">${escapeHtml({ value: page.title })}</h1>` : "";
    const list = postsForPage({ page, posts });
    const listHtml =
      list.length > 0 ? `<ul class="post-list">${list.map((post) => postPreview({ post })).join("\n")}</ul>` : "";
    return `<div class="home">${title}${page.html}${listHtml}</div>`;
  }

  if (page.layout === "post") {
    const title = page.title ? `<h1 class="post-title">${escapeHtml({ value: page.title })}</h1>` : "";
    return `<article class="post"><header class="post-header">${title}</header><div class="post-content">${page.html}</div></article>`;
  }

  const title = page.title ? `<h1 class="post-title">${escapeHtml({ value: page.title })}</h1>` : "";
  return `<article class="post"><header class="post-header">${title}</header><div class="page-content">${page.html}</div></article>`;
}
