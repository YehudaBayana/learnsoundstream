import { render, RenderResult } from "@testing-library/react";
import Progress, { ProgressSize, ProgressVariant } from "../Progress";
import { getByDataHook } from "@/__tests__/testUtils";

export interface ProgressDriverProps {
  dataHook?: string;
  value?: number;
  max?: number;
  size?: ProgressSize;
  variant?: ProgressVariant;
  showLabel?: boolean;
  animated?: boolean;
  formatLabel?: (value: number, max: number) => string;
}

export class ProgressDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-progress";

  render(props: ProgressDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Progress {...props} value={props.value ?? 50} dataHook={dataHook} />,
    );
    return this;
  }

  private getElement(suffix: string, dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult)
      throw new Error("ProgressDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, `${dataHook}${suffix}`);
  }

  getValue(dataHook = this.defaultDataHook): string | null {
    return this.getElement("-bar", dataHook).getAttribute("aria-valuenow");
  }

  getBarClassName(dataHook = this.defaultDataHook): string {
    return this.getElement("-bar", dataHook).className;
  }

  getFillClassName(dataHook = this.defaultDataHook): string {
    return this.getElement("-fill", dataHook).className;
  }

  getFillWidth(dataHook = this.defaultDataHook): string {
    return (this.getElement("-fill", dataHook) as HTMLDivElement).style.width;
  }

  getLabel(dataHook = this.defaultDataHook): string {
    return this.getElement("-label", dataHook).textContent?.trim() ?? "";
  }
}
