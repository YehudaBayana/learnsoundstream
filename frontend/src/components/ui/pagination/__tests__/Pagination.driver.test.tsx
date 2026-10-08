import { PaginationDriver } from './Pagination.driver';

describe('Pagination', () => {
  let driver: PaginationDriver;

  beforeEach(() => {
    driver = new PaginationDriver();
  });

  it('marks the current page and disables previous on the first page', () => {
    driver.render({ dataHook: 'history-pages', currentPage: 1, totalPages: 5 });
    expect(driver.hasRoot('history-pages')).toBe(true);
    expect(driver.isCurrentPage(1, 'history-pages')).toBe(true);
    expect(driver.isButtonDisabled('previous', 'history-pages')).toBe(true);
  });

  it('emits navigation changes for page and next actions', () => {
    const onPageChange = jest.fn();
    driver.render({ onPageChange });
    driver.clickPage(3);
    driver.clickNext();
    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2);
  });

  it('omits the root for a single page', () => {
    driver.render({ totalPages: 1 });
    expect(driver.hasRoot()).toBe(false);
  });
});