import { fireEvent, render, RenderResult } from '@testing-library/react';
import Pagination, { PaginationSize } from '../Pagination';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export interface PaginationDriverProps {
  dataHook?: string;
  currentPage?: number;
  totalPages?: number;
  size?: PaginationSize;
  disabled?: boolean;
  onPageChange?: (page: number) => void;
}

export class PaginationDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-pagination';

  render(props: PaginationDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<Pagination dataHook={dataHook} currentPage={props.currentPage ?? 1}
      totalPages={props.totalPages ?? 5} size={props.size} disabled={props.disabled}
      onPageChange={props.onPageChange ?? jest.fn()} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('PaginationDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  hasRoot(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  isButtonDisabled(suffix: string, dataHook = this.defaultDataHook): boolean {
    return (getByDataHook(this.getContainer(), `${dataHook}-${suffix}`) as HTMLButtonElement).disabled;
  }

  isCurrentPage(page: number, dataHook = this.defaultDataHook): boolean {
    return getByDataHook(this.getContainer(), `${dataHook}-page-${page}`).getAttribute('aria-current') === 'page';
  }

  clickPage(page: number, dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-page-${page}`));
  }

  clickNext(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-next`));
  }
}