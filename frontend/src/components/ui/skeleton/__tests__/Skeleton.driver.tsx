import { render, RenderResult } from "@testing-library/react";
import Skeleton, { SkeletonVariant } from "../Skeleton";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface SkeletonDriverProps {
  dataHook?: string;
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

export class SkeletonDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-skeleton";
  private lineCount = 1;

  render(props: SkeletonDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.lineCount = props.variant === "text" && (props.lines ?? 1) > 1 ? (props.lines ?? 1) : 1;
    this.renderResult = render(<Skeleton {...props} dataHook={dataHook} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("SkeletonDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).className;
  }

  getLineCount(dataHook = this.defaultDataHook): number {
    return Array.from({ length: this.lineCount }, (_, index) =>
      queryByDataHook(this.getContainer(), `${dataHook}-line-${index}`),
    ).filter(Boolean).length;
  }

  hasAnimation(dataHook = this.defaultDataHook): boolean {
    return this.getClassName(dataHook).includes("animate-pulse");
  }

  getWidth(dataHook = this.defaultDataHook): string {
    return (getByDataHook(this.getContainer(), dataHook) as HTMLDivElement).style.width;
  }
}
