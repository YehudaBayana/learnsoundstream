import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Link, { LinkVariant } from '../Link';
import { getByDataHook } from '@/__tests__/testUtils';

export interface LinkDriverProps {
  dataHook?: string;
  to?: string;
  external?: boolean;
  variant?: LinkVariant;
}

export class LinkDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-link';

  render(props: LinkDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <MemoryRouter>
        <Link to={props.to ?? '/library'} external={props.external} variant={props.variant} dataHook={dataHook}>
          Library
        </Link>
      </MemoryRouter>
    );
    return this;
  }

  private getRoot(dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) throw new Error('LinkDriver: render() must be called before querying');
    return getByDataHook(this.renderResult.container, dataHook);
  }

  getHref(dataHook = this.defaultDataHook): string | null {
    return this.getRoot(dataHook).getAttribute('href');
  }

  getTarget(dataHook = this.defaultDataHook): string | null {
    return this.getRoot(dataHook).getAttribute('target');
  }

  getClassName(dataHook = this.defaultDataHook): string {
    return this.getRoot(dataHook).className;
  }
}