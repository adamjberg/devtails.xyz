import { join } from "path";
import { watch } from "fs";
import { root, dist } from "./config";
import { build } from "./run";
import { exists, isFile } from "./fs";

export function serve() {
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

export function watchAndRebuild() {
  let timer: Timer | undefined;
  const rebuild = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void build({ production: false }).catch((error) => {
        console.error(error);
      });
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
