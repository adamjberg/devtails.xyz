import { postsForPage } from "./content";
import { escapeHtml } from "./html";
import { postPreview } from "./markdown";
import type { Page, Post } from "./types";

export function renderPageBody({ page, posts }: { page: Page; posts: Post[] }): string {
  if (page.layout === "default") return page.html;

  if (page.layout === "home") {
    const title = page.title ? `<h1 class="page-heading">${escapeHtml({ value: page.title })}</h1>` : "";
    const list = postsForPage({ page, posts });
    const isHome = page.url === "/";
    const filter = isHome
      ? `<div class="post-list-filter">
  <input type="search" id="post-filter" class="search-input" autocomplete="off" spellcheck="false" placeholder="Filter by title or description…" aria-label="Filter posts">
  <p id="post-filter-status" class="search-status" aria-live="polite" hidden></p>
</div>`
      : "";
    const listHtml =
      list.length > 0
        ? `${filter}<ul class="post-list" id="home-post-list">${list.map((post) => postPreview({ post })).join("\n")}</ul>${isHome ? '\n<script type="module" src="/assets/post-filter.js"></script>' : ""}`
        : filter;
    return `<div class="home">${title}${page.html}${listHtml}</div>`;
  }

  if (page.layout === "post") {
    const title = page.title ? `<h1 class="post-title">${escapeHtml({ value: page.title })}</h1>` : "";
    return `<article class="post"><header class="post-header">${title}</header><div class="post-content">${page.html}</div></article>`;
  }

  const title = page.title ? `<h1 class="post-title">${escapeHtml({ value: page.title })}</h1>` : "";
  return `<article class="post"><header class="post-header">${title}</header><div class="page-content">${page.html}</div></article>`;
}
