import Fuse from "fuse.js";

type SearchEntry = {
  title: string;
  url: string;
  description: string;
  date: string;
  tags: string[];
  text: string;
};

function escapeHtml({ value }: { value: string }): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderResult({ entry }: { entry: SearchEntry }): string {
  const tags = entry.tags
    .map((tag) => `<span><a href="/tags/${escapeHtml({ value: tag })}">${escapeHtml({ value: tag })}</a></span>`)
    .join("\n");
  const description = entry.description ? `<p>${escapeHtml({ value: entry.description })}</p>` : "";
  return `<hr>
<li>
  <h3 class="mb-0.5">
    <a class="post-link" href="${entry.url}">${escapeHtml({ value: entry.title })}</a>
  </h3>
  <span class="post-meta">
    <span>${entry.date}</span>${tags ? `\n    ·\n    ${tags}` : ""}
  </span>
  ${description}
</li>`;
}

const input = document.querySelector<HTMLInputElement>("#search-input");
const results = document.querySelector<HTMLElement>("#search-results");
const status = document.querySelector<HTMLElement>("#search-status");

if (!input || !results || !status) {
  throw new Error("Search page markup is missing required elements.");
}

let fuse: Fuse<SearchEntry> | undefined;
let indexedCount = 0;

function renderMatches({ matches }: { matches: Fuse.FuseResult<SearchEntry>[] }) {
  if (matches.length === 0) {
    results.innerHTML = "";
    return;
  }
  results.innerHTML = `<ul class="post-list">\n${matches.map((match) => renderResult({ entry: match.item })).join("\n")}\n</ul>`;
}

function runSearch() {
  if (!fuse) return;
  const query = input.value.trim();
  if (!query) {
    results.innerHTML = "";
    status.textContent = `Search ${indexedCount} posts by title, description, tags, or content.`;
    return;
  }
  const matches = fuse.search(query, { limit: 50 });
  status.textContent = `${matches.length} result${matches.length === 1 ? "" : "s"} for “${query}”`;
  renderMatches({ matches });
}

async function init() {
  const response = await fetch("/assets/search-index.json");
  if (!response.ok) throw new Error("Failed to load search index.");
  const entries = (await response.json()) as SearchEntry[];
  indexedCount = entries.length;
  fuse = new Fuse(entries, {
    keys: [
      { name: "title", weight: 0.35 },
      { name: "description", weight: 0.25 },
      { name: "tags", weight: 0.2 },
      { name: "text", weight: 0.2 },
    ],
    threshold: 0.38,
    ignoreLocation: true,
  });
  status.textContent = `Search ${indexedCount} posts by title, description, tags, or content.`;
}

input.addEventListener("input", runSearch);
void init();
