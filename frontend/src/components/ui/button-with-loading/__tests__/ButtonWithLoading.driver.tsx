import { fireEvent, render, RenderResult } from "@testing-library/react";
import ButtonWithLoading, { ButtonSize, ButtonVariant } from "../ButtonWithLoading";
import { getByDataHook } from "@/__tests__/testUtils";

export interface ButtonWithLoadingDriverProps {
  dataHook?: string;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
}

export class ButtonWithLoadingDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-loading-button";

  render(props: ButtonWithLoadingDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <ButtonWithLoading {...props} dataHook={dataHook}>
        Save
      </ButtonWithLoading>,
    );
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLButtonElement {
    if (!this.renderResult)
      throw new Error("ButtonWithLoadingDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, dataHook) as HTMLButtonElement;
  }

  isDisabled(dataHook = this.defaultDataHook): boolean {
    return this.getRoot(dataHook).disabled;
  }

  getText(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).textContent?.trim() ?? "";
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }

  click(dataHook = this.defaultDataHook): void {
    fireEvent.click(this.getRoot(dataHook));
  }
}
