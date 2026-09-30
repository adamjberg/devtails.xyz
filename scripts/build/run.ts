import { mkdirSync, rmSync } from "fs";
import { site, dist } from "./config";
import { loadPages, loadPosts } from "./content";
import { writeFeed, writeSitemap } from "./feed";
import { writeHtml } from "./fs";
import { layout } from "./layout";
import { activeNavFromUrl } from "./nav";
import { renderPageBody } from "./render-page";
import { renderPost } from "./render-post";
import { copyPostAssets, copyStatic } from "./static";
import { bundleClientScripts } from "./client-scripts";
import { absoluteUrl, outputFile } from "./urls";

export async function build({ production }: { production: boolean }) {
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
      body: renderPost({ post }),
      pages,
      production,
      activeNav: activeNavFromUrl({ url: post.url }),
    });
    writeHtml({ filePath: outputFile({ url: post.url }), html });
    copyPostAssets({ post });
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
      activeNav: activeNavFromUrl({ url: page.url }),
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
  await bundleClientScripts();
  console.log(`Built ${posts.length} posts and ${pages.length} pages into dist/`);
}
