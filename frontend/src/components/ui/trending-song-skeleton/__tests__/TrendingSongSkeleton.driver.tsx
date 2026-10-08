import { render, RenderResult } from "@testing-library/react";
import TrendingSongSkeleton from "../TrendingSongSkeleton";
import { queryByDataHook } from "@/__tests__/testUtils";

export class TrendingSongSkeletonDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-trending-skeleton";
  private itemCount = 1;

  render(dataHook = this.defaultDataHook, count = 1): this {
    this.itemCount = count;
    this.renderResult = render(<TrendingSongSkeleton dataHook={dataHook} count={count} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("TrendingSongSkeletonDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  getItemCount(dataHook = this.defaultDataHook): number {
    return Array.from({ length: this.itemCount }, (_, index) =>
      queryByDataHook(this.getContainer(), `${dataHook}-item-${index}`),
    ).filter(Boolean).length;
  }
}
