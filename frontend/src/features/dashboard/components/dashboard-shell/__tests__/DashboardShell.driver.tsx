import { fireEvent, render, RenderResult } from '@testing-library/react';
import DashboardShell from '../DashboardShell';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export class DashboardShellDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'dashboard-shell';

  render(dataHook = this.defaultDataHook): this {
    this.renderResult = render(
      <DashboardShell dataHook={dataHook}>
        <div data-hook={`${dataHook}-child`}>Page content</div>
      </DashboardShell>
    );
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('DashboardShellDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  hasPageContent(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-content`) !== null;
  }

  clickThemeToggle(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-theme-toggle`));
  }
}