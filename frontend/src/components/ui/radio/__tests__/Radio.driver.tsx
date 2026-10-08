import { fireEvent, render, RenderResult } from "@testing-library/react";
import Radio, { RadioSize } from "../Radio";
import { getByDataHook } from "@/__tests__/testUtils";

export interface RadioDriverProps {
  dataHook?: string;
  name?: string;
  value?: string;
  label?: string;
  size?: RadioSize;
  checked?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export class RadioDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-radio";

  render(props: RadioDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<Radio {...props} dataHook={dataHook} />);
    return this;
  }

  private getInput(dataHook = this.defaultDataHook): HTMLInputElement {
    if (!this.renderResult) throw new Error("RadioDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, `${dataHook}-input`) as HTMLInputElement;
  }

  isChecked(dataHook = this.defaultDataHook): boolean {
    return this.getInput(dataHook).checked;
  }

  click(dataHook = this.defaultDataHook): void {
    fireEvent.click(this.getInput(dataHook));
  }
}
