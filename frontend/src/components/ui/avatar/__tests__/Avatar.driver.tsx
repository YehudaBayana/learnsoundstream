import { fireEvent, render, RenderResult } from "@testing-library/react";
import Avatar, { AvatarSize, AvatarStatus } from "../Avatar";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface AvatarDriverProps {
  dataHook?: string;
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  square?: boolean;
}

export class AvatarDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-avatar";

  render(props: AvatarDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<Avatar {...props} dataHook={dataHook} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("AvatarDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  hasRoot(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  getRootClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).className;
  }

  getFallbackText(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-fallback`).textContent?.trim() ?? "";
  }

  hasImage(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-image`) !== null;
  }

  failImage(dataHook = this.defaultDataHook): void {
    fireEvent.error(getByDataHook(this.getContainer(), `${dataHook}-image`));
  }

  getStatusClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-status`).className;
  }
}
