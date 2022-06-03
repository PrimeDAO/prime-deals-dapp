import { RouteNode } from "aurelia";

export class BaseDocument {
  content: string;
  title: string;
  async load(_params: unknown, next: RouteNode, current: RouteNode): Promise<void> {
    this.title = current.title as string;
    this.content = await current.data.content;
  }
}
