import React from "react";
import { fireEvent, render, RenderResult } from "@testing-library/react";
import Input, { InputSize, InputVariant } from "../Input";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface InputDriverProps {
  dataHook?: string;
  size?: InputSize;
  variant?: InputVariant;
  error?: boolean;
  disabled?: boolean;
  value?: string;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export class InputDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-input";

  render(props: InputDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<Input {...props} dataHook={dataHook} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) {
      throw new Error("InputDriver: render() must be called before querying elements");
    }
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  getValue(dataHook = this.defaultDataHook): string {
    return (getByDataHook(this.getContainer(), `${dataHook}-input`) as HTMLInputElement).value;
  }

  isDisabled(dataHook = this.defaultDataHook): boolean {
    return (getByDataHook(this.getContainer(), `${dataHook}-input`) as HTMLInputElement).disabled;
  }

  isInvalid(dataHook = this.defaultDataHook): boolean {
    return (
      getByDataHook(this.getContainer(), `${dataHook}-input`).getAttribute("aria-invalid") ===
      "true"
    );
  }

  hasPlaceholder(placeholder: string, dataHook = this.defaultDataHook): boolean {
    return (
      getByDataHook(this.getContainer(), `${dataHook}-input`).getAttribute("placeholder") ===
      placeholder
    );
  }

  changeValue(value: string, dataHook = this.defaultDataHook): void {
    fireEvent.change(getByDataHook(this.getContainer(), `${dataHook}-input`), {
      target: { value },
    });
  }
}
