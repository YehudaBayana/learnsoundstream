import React from "react";
import { fireEvent, render, RenderResult } from "@testing-library/react";
import Form from "../Form";
import { getByDataHook } from "@/__tests__/testUtils";

export interface FormDriverProps {
  dataHook?: string;
  gap?: 4 | 6 | 8;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

export class FormDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-form";

  render(props: FormDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Form {...props} dataHook={dataHook}>
        <button type="submit" data-hook={`${dataHook}-submit`}>
          Submit
        </button>
      </Form>,
    );
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLFormElement {
    if (!this.renderResult) throw new Error("FormDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, dataHook) as HTMLFormElement;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }

  submit(dataHook = this.defaultDataHook): void {
    fireEvent.submit(this.getRoot(dataHook));
  }
}
