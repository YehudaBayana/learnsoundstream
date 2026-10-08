import { render, RenderResult } from "@testing-library/react";
import CommentSkeleton from "../CommentSkeleton";
import { queryByDataHook } from "@/__tests__/testUtils";

export class CommentSkeletonDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-comment-skeleton";
  private itemCount = 3;

  render(dataHook = this.defaultDataHook, count = 3): this {
    this.itemCount = count;
    this.renderResult = render(<CommentSkeleton dataHook={dataHook} count={count} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("CommentSkeletonDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  hasRoot(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  getItemCount(dataHook = this.defaultDataHook): number {
    return Array.from({ length: this.itemCount }, (_, index) =>
      queryByDataHook(this.getContainer(), `${dataHook}-item-${index}`),
    ).filter(Boolean).length;
  }
}
