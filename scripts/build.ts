import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, watch, writeFileSync } from "fs";
import { dirname, join, relative, resolve } from "path";
import matter from "gray-matter";
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

const site = {
  title: "dev/tails",
  description: "Thoughts, stories, and tutorials about software development",
  url: "https://devtails.xyz",
  email: "adam@devtails.xyz",
  googleAnalytics: "G-7FN2XPK0FD",
};

const root = resolve(import.meta.dir, "..");
const dist = join(root, "dist");

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

type Layout = "home" | "page" | "post" | "default";

type Post = {
  title: string;
  description: string;
  date: string;
  url: string;
  author: string;
  tags: string[];
  authorRank: number;
  html: string;
};

type Page = {
  title: string;
  description: string;
  url: string;
  html: string;
  layout: Layout;
  tag?: string;
  author?: string;
  ascending: boolean;
  showInHeader: boolean;
};

type SourceDoc = {
  filePath: string;
  data: Record<string, unknown>;
  content: string;
  isHtml: boolean;
};

function escapeHtml({ value }: { value: string }): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function walk({ dir }: { dir: string }): string[] {
  if (!exists({ path: dir })) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk({ dir: full }));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function exists({ path }: { path: string }): boolean {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function isFile({ path }: { path: string }): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function readTags({ data }: { data: Record<string, unknown> }): string[] {
  const raw = data.tags ?? data.tag;
  if (!raw) return [];
  const values = Array.isArray(raw) ? raw.map(String) : String(raw).split(/\s+/);
  return values.map((tag) => tag.trim()).filter(Boolean);
}

function pageUrl({ permalink, filePath }: { permalink?: string; filePath: string }): string {
  if (permalink) {
    const withSlash = permalink.startsWith("/") ? permalink : `/${permalink}`;
    if (withSlash.endsWith(".html")) return withSlash;
    if (withSlash === "/") return "/";
    return withSlash.replace(/\/$/, "");
  }

  let rel = relative(root, filePath).replaceAll("\\", "/");
  rel = rel.replace(/\.markdown$/, "").replace(/\.md$/, "").replace(/\.html$/, "");
  if (rel === "index") return "/";
  if (rel.endsWith("/index")) return `/${rel.slice(0, -"/index".length)}`;
  return `/${rel}`;
}

function outputFile({ url }: { url: string }): string {
  if (url.endsWith(".html")) return join(dist, url);
  if (url === "/") return join(dist, "index.html");
  return join(dist, url.slice(1), "index.html");
}

function postPreview({ post }: { post: Post }): string {
  const tags = post.tags
    .map((tag) => `<span><a href="/tags/${tag}">${escapeHtml({ value: tag })}</a></span>`)
    .join("\n");
  const description = post.description ? `<p>${escapeHtml({ value: post.description })}</p>` : "";
  return `<hr>
<li>
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

function renderMarkdown({ markdown, posts }: { markdown: string; posts: Post[] }): string {
  return marked.parse(prepareMarkdown({ markdown, posts }), { async: false }) as string;
}

function readSource({ filePath }: { filePath: string }): SourceDoc {
  const raw = readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  return {
    filePath,
    data: parsed.data as Record<string, unknown>,
    content: parsed.content,
    isHtml: filePath.endsWith(".html"),
  };
}

function loadPosts(): Post[] {
  const sources = walk({ dir: join(root, "_posts") })
    .filter((filePath) => filePath.endsWith(".md") || filePath.endsWith(".markdown"))
    .map((filePath) => readSource({ filePath }))
    .filter((source) => {
      const author = source.data.author ? String(source.data.author) : "adam";
      return author === "adam";
    });

  const posts: Post[] = sources.map((source) => {
    const dateMatch = source.filePath.match(/(\d{4}-\d{2}-\d{2})/);
    const permalink = source.data.permalink ? String(source.data.permalink) : undefined;
    return {
      title: source.data.title ? String(source.data.title) : "Untitled",
      description: source.data.description ? String(source.data.description).trim() : "",
      date: dateMatch?.[1] ?? "1970-01-01",
      url: pageUrl({ permalink, filePath: source.filePath }),
      author: source.data.author ? String(source.data.author) : "adam",
      tags: readTags({ data: source.data }),
      authorRank: Number(source.data.author_rank ?? 0),
      html: "",
    };
  });

  for (const [index, source] of sources.entries()) {
    const post = posts[index];
    if (!post) continue;
    post.html = renderMarkdown({ markdown: source.content, posts });
  }

  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function loadPages({ posts }: { posts: Post[] }): Page[] {
  const pageFiles = [
    join(root, "index.markdown"),
    join(root, "about.markdown"),
    join(root, "course.markdown"),
    join(root, "404.html"),
    ...walk({ dir: join(root, "learn") }),
    ...walk({ dir: join(root, "tags") }),
    ...walk({ dir: join(root, "authors") }),
  ].filter(
    (filePath) =>
      exists({ path: filePath }) &&
      (filePath.endsWith(".md") || filePath.endsWith(".markdown") || filePath.endsWith(".html")),
  );

  const pages: Page[] = pageFiles.map((filePath) => {
    const source = readSource({ filePath });
    const permalink = source.data.permalink ? String(source.data.permalink) : undefined;
    const layout = (source.data.layout ? String(source.data.layout) : "page") as Layout;
    const tag = source.data.tag ? String(source.data.tag).trim() : undefined;
    return {
      title: source.data.title ? String(source.data.title) : "",
      description: source.data.description ? String(source.data.description).trim() : "",
      url: pageUrl({ permalink, filePath }),
      html: source.isHtml ? source.content.trim() : renderMarkdown({ markdown: source.content, posts }),
      layout,
      tag,
      author: source.data.author ? String(source.data.author) : undefined,
      ascending: source.data.ascending === true,
      showInHeader: source.data.show_in_header === true,
    };
  });

  const existingTags = new Set(pages.map((page) => page.tag).filter((tag): tag is string => Boolean(tag)));
  for (const tag of new Set(posts.flatMap((post) => post.tags))) {
    if (existingTags.has(tag)) continue;
    pages.push({
      title: tag,
      description: "",
      url: `/tags/${tag}`,
      html: "",
      layout: "home",
      tag,
      ascending: false,
      showInHeader: false,
    });
  }

  return pages;
}

function postsForPage({ page, posts }: { page: Page; posts: Post[] }): Post[] {
  let selected = posts;
  if (page.author) selected = selected.filter((post) => post.author === page.author);
  else if (page.tag) selected = selected.filter((post) => post.tags.includes(page.tag!));
  else if (page.url !== "/") selected = [];
  if (page.ascending) selected = [...selected].reverse();
  return selected;
}

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

function renderPost({ post, posts }: { post: Post; posts: Post[] }): string {
  const tags = post.tags
    .map((tag) => `<span class="mr-1"><a href="/tags/${tag}">${escapeHtml({ value: tag })}</a></span>`)
    .join("");
  const subscribe = post.tags.includes("tails") || post.tags.includes("dev");
  return `<article class="post h-entry">
  <header class="post-header">
    <h1 class="post-title">${escapeHtml({ value: post.title })}</h1>
    <span class="post-meta">${tags}</span>
  </header>
  <div class="post-content">${post.html}</div>
  ${subscribe ? mailchimp() : ""}
  ${subscribe ? relatedPosts({ post, posts }) : ""}
</article>`;
}

function renderPageBody({ page, posts }: { page: Page; posts: Post[] }): string {
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

function layout({
  title,
  description,
  canonical,
  body,
  pages,
  production,
}: {
  title: string;
  description: string;
  canonical: string;
  body: string;
  pages: Page[];
  production: boolean;
}): string {
  const nav = pages
    .filter((page) => page.showInHeader && page.title)
    .map((page) => `<a href="${page.url}">${escapeHtml({ value: page.title })}</a>`)
    .join("");
  const analytics = production
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${site.googleAnalytics}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${site.googleAnalytics}');
</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml({ value: title })}</title>
  <meta name="description" content="${escapeHtml({ value: description })}">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" type="application/atom+xml" href="/feed.xml">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
  <meta name="msapplication-TileColor" content="#da532c">
  <meta name="theme-color" content="#ffffff">
  <link rel="stylesheet" href="/assets/highlight.css">
  <link rel="stylesheet" href="/assets/site.css">
  ${analytics}
</head>
<body>
  <header class="site-header">
    <div class="wrapper">
      <div class="site-title">/<a href="/">home</a>/<a href="/tags/dev">dev</a>/<a href="/tags/tails">tails</a></div>
      <nav class="site-nav">${nav}</nav>
    </div>
  </header>
  <main>
    <div class="wrapper">${body}</div>
  </main>
  <footer class="site-footer">
    <div class="wrapper">
      <p><a href="mailto:${site.email}">${site.email}</a></p>
      <p><a href="/feed.xml">RSS</a></p>
    </div>
  </footer>
</body>
</html>
`;
}

function writeHtml({ filePath, html }: { filePath: string; html: string }) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
}

function absoluteUrl({ url }: { url: string }): string {
  if (url === "/") return `${site.url}/`;
  return `${site.url}${url}`;
}

function writeFeed({ posts }: { posts: Post[] }) {
  const updated = posts[0] ? `${posts[0].date}T00:00:00Z` : new Date().toISOString();
  const entries = posts
    .map(
      (post) => `  <entry>
    <title>${escapeHtml({ value: post.title })}</title>
    <link href="${absoluteUrl({ url: post.url })}"/>
    <id>${absoluteUrl({ url: post.url })}</id>
    <updated>${post.date}T00:00:00Z</updated>
    <summary>${escapeHtml({ value: post.description })}</summary>
    <content type="html">${escapeHtml({ value: post.html })}</content>
  </entry>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeHtml({ value: site.title })}</title>
  <subtitle>${escapeHtml({ value: site.description })}</subtitle>
  <link href="${site.url}/feed.xml" rel="self"/>
  <link href="${site.url}/"/>
  <updated>${updated}</updated>
  <id>${site.url}/</id>
  <author><name>Adam Berg</name><email>${site.email}</email></author>
${entries}
</feed>
`;
  writeHtml({ filePath: join(dist, "feed.xml"), html: xml });
}

function writeSitemap({ urls }: { urls: string[] }) {
  const body = urls
    .map((url) => `  <url><loc>${escapeHtml({ value: absoluteUrl({ url }) })}</loc></url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  writeHtml({ filePath: join(dist, "sitemap.xml"), html: xml });
}

function copyStatic() {
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

function build({ production }: { production: boolean }) {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });

  const posts = loadPosts();
  const pages = loadPages({ posts });

  for (const post of posts) {
    const description = post.description || site.description;
    const html = layout({
      title: `${post.title} | ${site.title}`,
      description,
      canonical: absoluteUrl({ url: post.url }),
      body: renderPost({ post, posts }),
      pages,
      production,
    });
    writeHtml({ filePath: outputFile({ url: post.url }), html });
  }

  for (const page of pages) {
    const title = page.url === "/" || !page.title ? site.title : `${page.title} | ${site.title}`;
    const html = layout({
      title,
      description: page.description || site.description,
      canonical: absoluteUrl({ url: page.url === "/404.html" ? "/404.html" : page.url }),
      body: renderPageBody({ page, posts }),
      pages,
      production,
    });
    writeHtml({ filePath: outputFile({ url: page.url }), html });
  }

  writeFeed({ posts });
  writeSitemap({
    urls: ["/", ...posts.map((post) => post.url), ...pages.map((page) => page.url)].filter(
      (url, index, all) => url !== "/404.html" && all.indexOf(url) === index,
    ),
  });
  copyStatic();
  console.log(`Built ${posts.length} posts and ${pages.length} pages into dist/`);
}

function serve() {
  const port = 4000;
  Bun.serve({
    port,
    fetch(req) {
      const pathname = decodeURIComponent(new URL(req.url).pathname);
      if (pathname.includes("..")) return new Response("Bad request", { status: 400 });
      const filePath = join(dist, pathname);
      const indexPath = join(filePath, "index.html");
      const target = isFile({ path: filePath }) ? filePath : isFile({ path: indexPath }) ? indexPath : undefined;
      if (!target) {
        const notFound = join(dist, "404.html");
        return new Response(isFile({ path: notFound }) ? Bun.file(notFound) : "Not found", { status: 404 });
      }
      return new Response(Bun.file(target));
    },
  });
  console.log(`Serving dist/ at http://localhost:${port}`);
}

const serving = process.argv.includes("--serve");
build({ production: !serving });

if (serving) {
  serve();
  let timer: Timer | undefined;
  const rebuild = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        build({ production: false });
      } catch (error) {
        console.error(error);
      }
    }, 100);
  };
  for (const dir of ["_posts", "learn", "tags", "authors", "styles", "assets"]) {
    const path = join(root, dir);
    if (exists({ path })) watch(path, { recursive: true }, rebuild);
  }
  for (const file of ["index.markdown", "about.markdown", "course.markdown", "404.html"]) {
    watch(join(root, file), rebuild);
  }
}
