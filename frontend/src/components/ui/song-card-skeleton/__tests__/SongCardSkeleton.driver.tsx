import { render, RenderResult } from "@testing-library/react";
import SongCardSkeleton from "../SongCardSkeleton";
import { queryByDataHook } from "@/__tests__/testUtils";

export class SongCardSkeletonDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-song-card-skeleton";
  private itemCount = 1;

  render(dataHook = this.defaultDataHook, count = 1): this {
    this.itemCount = count;
    this.renderResult = render(<SongCardSkeleton dataHook={dataHook} count={count} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("SongCardSkeletonDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  getItemCount(dataHook = this.defaultDataHook): number {
    return Array.from({ length: this.itemCount }, (_, index) =>
      queryByDataHook(this.getContainer(), `${dataHook}-item-${index}`),
    ).filter(Boolean).length;
  }
}
