import { render, RenderResult } from "@testing-library/react";
import Footer from "../Footer";
import { queryByDataHook } from "@/__tests__/testUtils";

export class FooterDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "dashboard-footer";

  render(dataHook = this.defaultDataHook): this {
    this.renderResult = render(<Footer dataHook={dataHook} />);
    return this;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    if (!this.renderResult)
      throw new Error("FooterDriver: render() must be called before querying");
    return queryByDataHook(this.renderResult.container, dataHook) !== null;
  }
}
