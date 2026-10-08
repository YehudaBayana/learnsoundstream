import { render, RenderResult } from "@testing-library/react";
import Spacer from "../Spacer";
import { getByDataHook } from "@/__tests__/testUtils";

export interface SpacerDriverProps {
  dataHook?: string;
  size?: number;
  axis?: "horizontal" | "vertical";
}

export class SpacerDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-spacer";

  render(props: SpacerDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<Spacer {...props} dataHook={dataHook} />);
    return this;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    if (!this.renderResult)
      throw new Error("SpacerDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, dataHook).className;
  }
}
