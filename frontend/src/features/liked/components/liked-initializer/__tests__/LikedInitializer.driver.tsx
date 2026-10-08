import { render, RenderResult } from "@testing-library/react";
import LikedInitializer from "../LikedInitializer";
import { queryByDataHook } from "@/__tests__/testUtils";

export class LikedInitializerDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "liked-initializer";

  render(dataHook = this.defaultDataHook): this {
    this.renderResult = render(
      <LikedInitializer dataHook={dataHook}>
        <span data-hook={`${dataHook}-child`} />
      </LikedInitializer>,
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error(
        "LikedInitializerDriver: render() must be called before querying",
      );
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }
}
