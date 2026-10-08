import { render, RenderResult } from "@testing-library/react";
import HomeView from "../views/HomeView";
import { queryByDataHook } from "@/__tests__/testUtils";

export class HomeViewDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "home-view";

  render(dataHook = this.defaultDataHook): this {
    this.renderResult = render(<HomeView dataHook={dataHook} />);
    return this;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    if (!this.renderResult)
      throw new Error("HomeViewDriver: render() must be called before querying");
    return queryByDataHook(this.renderResult.container, dataHook) !== null;
  }
}
