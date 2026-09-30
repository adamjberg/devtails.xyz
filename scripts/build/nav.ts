export type ActiveNav = "home" | "dev" | "tails" | "about";

export function activeNavFromUrl({ url }: { url: string }): ActiveNav | undefined {
  if (url === "/") return "home";
  if (url === "/tags/dev") return "dev";
  if (url === "/tags/tails") return "tails";
  if (url === "/about" || url === "/about/") return "about";
  return undefined;
}
