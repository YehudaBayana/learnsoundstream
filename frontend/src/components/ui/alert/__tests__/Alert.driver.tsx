import { fireEvent, render, RenderResult } from "@testing-library/react";
import Alert, { AlertVariant } from "../Alert";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface AlertDriverProps {
  dataHook?: string;
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export class AlertDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-alert";

  render(props: AlertDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Alert {...props} dataHook={dataHook}>
        Message
      </Alert>,
    );
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) throw new Error("AlertDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, dataHook);
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.renderResult?.container ?? document, dataHook) !== null;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }

  hasDismissButton(dataHook = this.defaultDataHook): boolean {
    if (!this.renderResult) throw new Error("AlertDriver: render() must be called before querying");
    return queryByDataHook(this.renderResult.container, `${dataHook}-dismiss`) !== null;
  }

  clickDismiss(dataHook = this.defaultDataHook): void {
    if (!this.renderResult) throw new Error("AlertDriver: render() must be called before querying");
    fireEvent.click(getByDataHook(this.renderResult.container, `${dataHook}-dismiss`));
  }
}
