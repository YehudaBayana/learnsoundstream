import { render, RenderResult } from "@testing-library/react";
import Divider, { DividerOrientation, DividerVariant } from "../Divider";
import { getByDataHook } from "@/__tests__/testUtils";

export interface DividerDriverProps {
  dataHook?: string;
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  children?: string;
}

export class DividerDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-divider";

  render(props: DividerDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<Divider {...props} dataHook={dataHook} />);
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult)
      throw new Error("DividerDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, dataHook);
  }

  getTagName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).tagName;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }
}
