export type ArticleItem = {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  type?: number;
  title?: string;
  picUrl?: string;
  videoUrl?: string;
  summary?: string;
  content?: string;
  sort?: number;
  status?: number;
  isTop?: number;
  i18n?: Record<string, unknown>;
};
