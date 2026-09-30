import Fuse from "fuse.js";

type ListItem = {
  title: string;
  description: string;
  element: HTMLElement;
};

const input = document.querySelector<HTMLInputElement>("#post-filter");
const status = document.querySelector<HTMLElement>("#post-filter-status");
const list = document.querySelector<HTMLElement>("#home-post-list");

if (input && status && list) {
  const items: ListItem[] = [...list.querySelectorAll<HTMLElement>(".post-list-item")].map((element) => ({
    title: element.dataset.title ?? "",
    description: element.dataset.description ?? "",
    element,
  }));

  const fuse = new Fuse(items, {
    keys: [
      { name: "title", weight: 0.8 },
      { name: "description", weight: 0.2 },
    ],
    threshold: 0.38,
    ignoreLocation: true,
  });

  function setStatus({ message }: { message: string }) {
    status.textContent = message;
    status.hidden = message.length === 0;
  }

  function applyFilter() {
    const query = input.value.trim();
    if (!query) {
      for (const item of items) item.element.hidden = false;
      setStatus({ message: "" });
      return;
    }
    const matches = new Set(fuse.search(query).map((match) => match.item.element));
    for (const item of items) {
      item.element.hidden = !matches.has(item.element);
    }
    const visible = matches.size;
    if (visible === 0) {
      setStatus({ message: "" });
      return;
    }
    setStatus({ message: `${visible} result${visible === 1 ? "" : "s"} for “${query}”` });
  }

  setStatus({ message: "" });
  input.addEventListener("input", applyFilter);
}
