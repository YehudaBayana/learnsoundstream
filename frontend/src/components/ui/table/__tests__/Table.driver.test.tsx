import { TableDriver } from './Table.driver';

describe('Table', () => {
  let driver: TableDriver;

  beforeEach(() => {
    driver = new TableDriver();
  });

  it('renders compound table sections under a root hook', () => {
    driver.render({ dataHook: 'track-table' });

    expect(driver.hasRoot('track-table')).toBe(true);
    expect(driver.getTableClassName('track-table')).toContain('table-auto');
  });

  it('applies striped and selected row styles', () => {
    driver.render({ striped: true, selectedRow: true });

    expect(driver.getTableClassName()).toContain('[&_tbody_tr:nth-child(even)]:bg-gray-50');
    expect(driver.getSelectedRowClassName()).toContain('bg-emerald-50');
  });

  it('runs the sort handler when a sortable column is clicked', () => {
    const onSort = jest.fn();
    driver.render({ onSort });
    driver.clickSortableHeader();

    expect(onSort).toHaveBeenCalledTimes(1);
  });
});