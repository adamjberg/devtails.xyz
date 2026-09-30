import { build } from "./build/run";
import { serve, watchAndRebuild } from "./build/serve";

const serving = process.argv.includes("--serve");
build({ production: !serving });

if (serving) {
  serve();
  watchAndRebuild();
}
