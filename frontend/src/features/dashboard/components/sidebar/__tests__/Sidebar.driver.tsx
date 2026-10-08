import { fireEvent, render, RenderResult } from '@testing-library/react';
import Sidebar from '../Sidebar';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export class SidebarDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'dashboard-sidebar';

  render(dataHook = this.defaultDataHook): this {
    this.renderResult = render(<Sidebar dataHook={dataHook} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('SidebarDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  hasNavigationItem(index: number, dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), `${dataHook}-nav-${index}`) !== null;
  }

  clickCreatePlaylist(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-create-playlist`));
  }

  isCreateModalOpen(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(document.body, `${dataHook}-create-modal`) !== null;
  }
}