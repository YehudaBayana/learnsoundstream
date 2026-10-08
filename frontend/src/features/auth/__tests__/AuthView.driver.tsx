import { fireEvent, render, RenderResult } from "@testing-library/react";
import AuthView from "../views/auth-view/AuthView";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export class AuthViewDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "auth-view";
  private currentDataHook = this.defaultDataHook;

  render(dataHook = this.defaultDataHook): this {
    this.currentDataHook = dataHook;
    this.renderResult = render(<AuthView dataHook={dataHook} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("AuthViewDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  hasLogin(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-login`) !== null;
  }

  hasRegister(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-register`) !== null;
  }

  switchToRegister(): void {
    fireEvent.click(getByDataHook(this.getContainer(), "login-switch-to-register-button"));
  }

  switchToLogin(): void {
    fireEvent.click(
      getByDataHook(this.getContainer(), `${this.currentDataHook}-register-switch-to-login-button`),
    );
  }
}
