import React from "react";
import { render, RenderResult, fireEvent } from "@testing-library/react";
import { Login } from "../components/login/Login";
import { queryByDataHook, getByDataHook } from "@/__tests__/testUtils";

export interface LoginDriverProps {
  onSwitchToRegister?: () => void;
  dataHook?: string;
}

export class LoginDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook: string = "auth-login-view";

  render(props: LoginDriverProps = {}): this {
    const dataHook = props.dataHook || this.defaultDataHook;
    const onSwitchToRegister = props.onSwitchToRegister || jest.fn();
    this.renderResult = render(
      <Login onSwitchToRegister={onSwitchToRegister} dataHook={dataHook} />,
    );
    return this;
  }

  exists(dataHook: string = this.defaultDataHook): boolean {
    if (!this.renderResult) return false;
    return queryByDataHook(this.renderResult.container, dataHook) !== null;
  }

  getHeadingText(): string {
    if (!this.renderResult) throw new Error("LoginDriver: render() required");
    const heading = getByDataHook(this.renderResult.container, "login-heading");
    return heading.textContent?.trim() ?? "";
  }

  getEmailValue(): string {
    if (!this.renderResult) throw new Error("LoginDriver: render() required");
    const input = getByDataHook(
      this.renderResult.container,
      "login-email-input",
    ) as HTMLInputElement;
    return input.value;
  }

  getPasswordValue(): string {
    if (!this.renderResult) throw new Error("LoginDriver: render() required");
    const input = getByDataHook(
      this.renderResult.container,
      "login-password-input",
    ) as HTMLInputElement;
    return input.value;
  }

  typeEmail(email: string): void {
    if (!this.renderResult) throw new Error("LoginDriver: render() required");
    const input = getByDataHook(this.renderResult.container, "login-email-input");
    fireEvent.change(input, { target: { value: email } });
  }

  typePassword(password: string): void {
    if (!this.renderResult) throw new Error("LoginDriver: render() required");
    const input = getByDataHook(this.renderResult.container, "login-password-input");
    fireEvent.change(input, { target: { value: password } });
  }

  submit(): void {
    if (!this.renderResult) throw new Error("LoginDriver: render() required");
    const form = getByDataHook(this.renderResult.container, "login-form");
    fireEvent.submit(form);
  }

  clickSwitchToRegister(): void {
    if (!this.renderResult) throw new Error("LoginDriver: render() required");
    const button = getByDataHook(this.renderResult.container, "login-switch-to-register-button");
    fireEvent.click(button);
  }
}
