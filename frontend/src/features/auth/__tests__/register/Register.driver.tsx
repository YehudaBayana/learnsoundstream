import { fireEvent, render, RenderResult } from "@testing-library/react";
import { Register } from "../../components/register/Register";
import { getByDataHook } from "@/__tests__/testUtils";

export interface RegisterDriverProps {
  dataHook?: string;
  onSwitchToLogin?: () => void;
}

export class RegisterDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "auth-register-view";

  render(props: RegisterDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Register dataHook={dataHook} onSwitchToLogin={props.onSwitchToLogin ?? jest.fn()} />,
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("RegisterDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  typeEmail(value: string, dataHook = this.defaultDataHook): void {
    fireEvent.change(getByDataHook(this.getContainer(), `${dataHook}-email-input`), {
      target: { value },
    });
  }

  typePassword(value: string, dataHook = this.defaultDataHook): void {
    fireEvent.change(getByDataHook(this.getContainer(), `${dataHook}-password-input`), {
      target: { value },
    });
  }

  submit(dataHook = this.defaultDataHook): void {
    fireEvent.submit(getByDataHook(this.getContainer(), `${dataHook}-form`));
  }

  switchToLogin(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-switch-to-login-button`));
  }
}
