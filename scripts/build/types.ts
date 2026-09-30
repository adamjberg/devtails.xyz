export type Layout = "home" | "page" | "post" | "default" | "search";

export type Post = {
  title: string;
  description: string;
  date: string;
  url: string;
  author: string;
  tags: string[];
  searchText: string;
  html: string;
};

export type Page = {
  title: string;
  description: string;
  url: string;
  html: string;
  layout: Layout;
  tag?: string;
  author?: string;
  ascending: boolean;
  showInHeader: boolean;
};

export type SourceDoc = {
  filePath: string;
  data: Record<string, unknown>;
  content: string;
  isHtml: boolean;
};
