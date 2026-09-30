import { readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { root } from "./config";
import { exists, walk } from "./fs";
import { renderMarkdown } from "./markdown";
import type { Layout, Page, Post, SourceDoc } from "./types";
import { pageUrl } from "./urls";

function readTags({ data }: { data: Record<string, unknown> }): string[] {
  const raw = data.tags ?? data.tag;
  if (!raw) return [];
  const values = Array.isArray(raw) ? raw.map(String) : String(raw).split(/\s+/);
  return values.map((tag) => tag.trim()).filter(Boolean);
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

export function loadPosts(): Post[] {
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

export function loadPages({ posts }: { posts: Post[] }): Page[] {
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

export function postsForPage({ page, posts }: { page: Page; posts: Post[] }): Post[] {
  let selected = posts;
  if (page.author) selected = selected.filter((post) => post.author === page.author);
  else if (page.tag) selected = selected.filter((post) => post.tags.includes(page.tag!));
  else if (page.url !== "/") selected = [];
  if (page.ascending) selected = [...selected].reverse();
  return selected;
}
