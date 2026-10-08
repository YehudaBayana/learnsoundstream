import React from "react";
import { render, RenderResult } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Breadcrumb, { BreadcrumbItem } from "../Breadcrumb";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface BreadcrumbDriverProps {
  dataHook?: string;
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

export class BreadcrumbDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-breadcrumb";

  render(props: BreadcrumbDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <MemoryRouter>
        <Breadcrumb
          dataHook={dataHook}
          showHome={props.showHome}
          items={
            props.items ?? [
              { label: "Home", href: "/" },
              { label: "Library", href: "/library" },
              { label: "Current" },
            ]
          }
        />
      </MemoryRouter>,
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("BreadcrumbDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  getLinkHref(index: number, dataHook = this.defaultDataHook): string | null {
    return getByDataHook(this.getContainer(), `${dataHook}-link-${index}`).getAttribute("href");
  }

  isCurrentItemMarked(dataHook = this.defaultDataHook): boolean {
    return (
      getByDataHook(this.getContainer(), `${dataHook}-current`).getAttribute("aria-current") ===
      "page"
    );
  }
}
