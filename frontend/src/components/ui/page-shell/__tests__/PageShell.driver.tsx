import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import PageShell from '../PageShell';
import { queryByDataHook } from '@/__tests__/testUtils';

export interface PageShellDriverProps {
  dataHook?: string;
  title?: React.ReactNode;
  loading?: boolean;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  footerSpacer?: boolean;
}

export class PageShellDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-page-shell';

  render(props: PageShellDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <PageShell
        {...props}
        dataHook={dataHook}
        title={<span data-hook={`${dataHook}-title`}>Page title</span>}
        actions={props.actions ?? <span data-hook={`${dataHook}-actions`}>Actions</span>}
      >
        <span data-hook={`${dataHook}-content`}>Page content</span>
      </PageShell>
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) {
      throw new Error('PageShellDriver: render() must be called before querying elements');
    }
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  hasElement(suffix: 'title' | 'actions' | 'content', dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-${suffix}`) !== null;
  }
}