import { fireEvent, render, RenderResult } from "@testing-library/react";
import Checkbox, { CheckboxSize } from "../Checkbox";
import { getByDataHook } from "@/__tests__/testUtils";

export interface CheckboxDriverProps {
  dataHook?: string;
  size?: CheckboxSize;
  label?: string;
  description?: string;
  disabled?: boolean;
  defaultChecked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export class CheckboxDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-checkbox";

  render(props: CheckboxDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<Checkbox {...props} dataHook={dataHook} />);
    return this;
  }

  private getInput(dataHook = this.defaultDataHook): HTMLInputElement {
    if (!this.renderResult)
      throw new Error("CheckboxDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, `${dataHook}-input`) as HTMLInputElement;
  }

  isChecked(dataHook = this.defaultDataHook): boolean {
    return this.getInput(dataHook).checked;
  }

  isDisabled(dataHook = this.defaultDataHook): boolean {
    return this.getInput(dataHook).disabled;
  }

  click(dataHook = this.defaultDataHook): void {
    fireEvent.click(this.getInput(dataHook));
  }
}
