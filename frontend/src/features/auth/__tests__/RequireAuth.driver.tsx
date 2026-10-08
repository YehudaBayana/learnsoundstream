import React from 'react';
import { fireEvent, render, RenderResult } from '@testing-library/react';
import RequireAuth from '../components/require-auth/RequireAuth';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export class RequireAuthDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'require-auth';

  render(dataHook = this.defaultDataHook): this {
    this.renderResult = render(<RequireAuth dataHook={dataHook}><div data-hook={`${dataHook}-child`} /></RequireAuth>);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('RequireAuthDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  hasRoot(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  hasChild(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-child`) !== null;
  }

  hasError(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-error`) !== null;
  }

  clickRetry(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-retry`));
  }
}