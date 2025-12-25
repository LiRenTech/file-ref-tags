// 引用项数据结构
export interface ReferenceItem {
  id: string;
  type: "file" | "file-snippet" | "global-snippet" | "comment";
  title: string;
  filePath?: string;
  snippet?: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
