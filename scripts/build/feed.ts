import { join } from "path";
import { dist, site } from "./config";
import { writeHtml } from "./fs";
import { escapeHtml } from "./html";
import type { Post } from "./types";
import { absoluteUrl } from "./urls";

export function writeFeed({ posts }: { posts: Post[] }) {
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

export function writeSitemap({ urls }: { urls: string[] }) {
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
