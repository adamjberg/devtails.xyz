import { site } from "./config";
import { escapeHtml } from "./html";
import type { ActiveNav } from "./nav";
import type { Page } from "./types";

function navItem({ href, label, active }: { href: string; label: string; active: boolean }): string {
  if (active) {
    return `<span class="site-nav-active" aria-current="page">${escapeHtml({ value: label })}</span>`;
  }
  return `<a href="${href}">${escapeHtml({ value: label })}</a>`;
}

export function layout({
  title,
  description,
  canonical,
  body,
  pages,
  production,
  activeNav,
}: {
  title: string;
  description: string;
  canonical: string;
  body: string;
  pages: Page[];
  production: boolean;
  activeNav?: ActiveNav;
}): string {
  const headerNav = pages
    .filter((page) => page.showInHeader && page.title)
    .map((page) =>
      navItem({
        href: page.url,
        label: page.title,
        active: activeNav === "about" && (page.url === "/about" || page.url === "/about/"),
      }),
    )
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
    <div class="wrapper site-header-inner">
      <div class="site-header-home">${navItem({ href: "/", label: "/home", active: activeNav === "home" })}</div>
      <div class="site-brand">${navItem({ href: "/tags/dev", label: "dev", active: activeNav === "dev" })} / ${navItem({ href: "/tags/tails", label: "tails", active: activeNav === "tails" })}</div>
      <nav class="site-nav">${headerNav}</nav>
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
