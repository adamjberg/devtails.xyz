import { join } from "path";
import { dist, root } from "./config";

export async function bundleClientScripts() {
  const result = await Bun.build({
    entrypoints: [join(root, "scripts", "build", "client", "post-filter.ts")],
    outdir: join(dist, "assets"),
    minify: true,
    target: "browser",
  });
  if (!result.success) {
    throw new Error(result.logs.map((log) => log.message).join("\n"));
  }
}
