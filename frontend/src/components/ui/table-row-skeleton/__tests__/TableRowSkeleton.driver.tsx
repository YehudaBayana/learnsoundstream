import { render, RenderResult } from '@testing-library/react';
import TableRowSkeleton from '../TableRowSkeleton';
import { queryByDataHook } from '@/__tests__/testUtils';

export class TableRowSkeletonDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-table-row-skeleton';
  private rowCount = 1;

  render(dataHook = this.defaultDataHook, count = 1): this {
    this.rowCount = count;
    this.renderResult = render(<table><tbody><TableRowSkeleton dataHook={dataHook} count={count} /></tbody></table>);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('TableRowSkeletonDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  getRowCount(dataHook = this.defaultDataHook): number {
    return Array.from({ length: this.rowCount }, (_, index) =>
      queryByDataHook(this.getContainer(), `${dataHook}-row-${index}`)
    ).filter(Boolean).length;
  }
}