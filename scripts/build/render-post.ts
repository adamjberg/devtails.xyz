import { escapeHtml } from "./html";
import { postPreview } from "./markdown";
import type { Post } from "./types";

function mailchimp(): string {
  return `<hr>
<div id="mc_embed_signup">
  <form action="https://xyz.us1.list-manage.com/subscribe/post?u=d597bd6edc50da6946aed0608&amp;id=83f1715cd3" method="post" target="_blank" novalidate>
    <h2>Subscribe to Monthly Newsletter</h2>
    <div class="mc-field-group">
      <label for="mce-EMAIL">Email Address <span class="asterisk">*</span></label>
      <input type="email" name="EMAIL" class="required email" id="mce-EMAIL" required>
    </div>
    <div hidden="true"><input type="hidden" name="tags" value="3991333"></div>
    <div style="position: absolute; left: -5000px;" aria-hidden="true">
      <input type="text" name="b_d597bd6edc50da6946aed0608_83f1715cd3" tabindex="-1" value="">
    </div>
    <input type="submit" value="Subscribe" name="subscribe" class="button">
  </form>
</div>`;
}

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
  const subscribe = post.tags.includes("tails") || post.tags.includes("dev");
  return `<article class="post h-entry">
  <header class="post-header">
    <h1 class="post-title">${escapeHtml({ value: post.title })}</h1>
    <span class="post-meta"><span>${post.date}</span>${tags ? ` · ${tags}` : ""}</span>
  </header>
  <div class="post-content">${post.html}</div>
  ${subscribe ? mailchimp() : ""}
  ${subscribe ? relatedPosts({ post, posts }) : ""}
</article>`;
}
