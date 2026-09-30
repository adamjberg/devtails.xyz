export function markdownToSearchText({ markdown }: { markdown: string }): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\{%-?[\s\S]*?-?%\}/g, " ")
    .replace(/\{\{[\s\S]*?\}\}/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~`>#|-]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
