import { join, resolve } from "path";

export const site = {
  title: "dev/tails",
  description: "Thoughts, stories, and tutorials about software development",
  url: "https://devtails.xyz",
  email: "adam@devtails.xyz",
  googleAnalytics: "G-7FN2XPK0FD",
};

export const root = resolve(import.meta.dir, "../..");
export const dist = join(root, "dist");
