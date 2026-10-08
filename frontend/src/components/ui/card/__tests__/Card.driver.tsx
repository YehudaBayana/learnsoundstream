import React from "react";
import { fireEvent, render, RenderResult } from "@testing-library/react";
import Card, { CardPadding, CardVariant } from "../Card";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface CardDriverProps {
  dataHook?: string;
  variant?: CardVariant;
  hoverable?: boolean;
  clickable?: boolean;
  as?: "div" | "article" | "section" | "button";
  padding?: CardPadding;
  onClick?: () => void;
  includeHeader?: boolean;
  includeBody?: boolean;
  includeFooter?: boolean;
}

export class CardDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-card";

  render(props: CardDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    const { includeHeader, includeBody, includeFooter, ...cardProps } = props;
    this.renderResult = render(
      <Card {...cardProps} dataHook={dataHook}>
        {includeHeader && <Card.Header dataHook={`${dataHook}-header`}>Header</Card.Header>}
        {includeBody !== false && <Card.Body dataHook={`${dataHook}-body`}>Body</Card.Body>}
        {includeFooter && <Card.Footer dataHook={`${dataHook}-footer`}>Footer</Card.Footer>}
      </Card>,
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) {
      throw new Error("CardDriver: render() must be called before querying elements");
    }
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  getTagName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).tagName;
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), dataHook).className;
  }

  getPartText(part: "header" | "body" | "footer", dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-${part}`).textContent?.trim() ?? "";
  }

  click(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), dataHook));
  }
}
