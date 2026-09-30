import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import css from "highlight.js/lib/languages/css";
import diff from "highlight.js/lib/languages/diff";
import ini from "highlight.js/lib/languages/ini";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import rust from "highlight.js/lib/languages/rust";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import { Marked } from "marked";
import { escapeHtml } from "./html";
import type { Post } from "./types";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("diff", diff);
hljs.registerLanguage("ini", ini);

const languageAlias: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  javascript: "javascript",
  ts: "typescript",
  tsx: "typescript",
  typescript: "typescript",
  rust: "rust",
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  html: "xml",
  xml: "xml",
  css: "css",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  diff: "diff",
  toml: "ini",
};

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    code({ text, lang }) {
      const language = lang ? languageAlias[lang.toLowerCase()] : undefined;
      const highlighted =
        language && hljs.getLanguage(language)
          ? hljs.highlight(text, { language }).value
          : escapeHtml({ value: text });
      const className = language ? ` class="hljs language-${language}"` : "";
      return `<pre><code${className}>${highlighted}</code></pre>\n`;
    },
  },
});

function postPreview({ post }: { post: Post }): string {
  const tags = post.tags
    .map((tag) => `<span><a href="/tags/${tag}">${escapeHtml({ value: tag })}</a></span>`)
    .join("\n");
  const description = post.description ? `<p>${escapeHtml({ value: post.description })}</p>` : "";
  return `<li class="post-list-item" data-title="${escapeHtml({ value: post.title })}" data-description="${escapeHtml({ value: post.description })}">
  <hr>
  <h3 class="mb-0.5">
    <a class="post-link" href="${post.url}">${escapeHtml({ value: post.title })}</a>
  </h3>
  <span class="post-meta">
    <span>${post.date}</span>${tags ? `\n    ·\n    ${tags}` : ""}
  </span>
  ${description}
</li>`;
}

function prepareMarkdown({ markdown, posts }: { markdown: string; posts: Post[] }): string {
  const withAssets = markdown.replace(
    /\{\{\s*["']([^"']+)["']\s*\|\s*relative_url\s*\}\}/g,
    (_match, assetPath: string) => assetPath,
  );
  const withoutKramdown = withAssets.replace(/\{:\s*target\s*=\s*["']_blank["']\s*\}/g, "");
  return withoutKramdown.replace(
    /\{%-?\s*assign post_ids = "([^"]+)"\s*\|\s*split:\s*", "\s*-?%\}[\s\S]*?<\/ul>/g,
    (_match, ids: string) => {
      const wanted = new Set(
        ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      );
      const matched = posts.filter((post) => wanted.has(post.url));
      return `<ul class="post-list">\n${matched.map((post) => postPreview({ post })).join("\n")}\n</ul>`;
    },
  );
}

export function renderMarkdown({ markdown, posts }: { markdown: string; posts: Post[] }): string {
  return marked.parse(prepareMarkdown({ markdown, posts }), { async: false }) as string;
}

export { postPreview };
