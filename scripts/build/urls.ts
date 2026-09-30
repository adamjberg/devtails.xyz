import { join, relative } from "path";
import { dist, root, site } from "./config";

export function pageUrl({ permalink, filePath }: { permalink?: string; filePath: string }): string {
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

export function outputFile({ url }: { url: string }): string {
  if (url.endsWith(".html")) return join(dist, url);
  if (url === "/") return join(dist, "index.html");
  return join(dist, url.slice(1), "index.html");
}

export function absoluteUrl({ url }: { url: string }): string {
  if (url === "/") return `${site.url}/`;
  return `${site.url}${url}`;
}
