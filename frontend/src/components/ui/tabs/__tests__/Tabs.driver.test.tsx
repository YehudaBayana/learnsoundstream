import { TabsDriver } from './Tabs.driver';

describe('Tabs', () => {
  let driver: TabsDriver;

  beforeEach(() => {
    driver = new TabsDriver();
  });

  it('renders the default panel and switches tabs through hooks', () => {
    driver.render({ dataHook: 'library-tabs' });
    expect(driver.isSelected('one', 'library-tabs')).toBe(true);
    expect(driver.isPanelVisible('one', 'library-tabs')).toBe(true);
    driver.clickTab('two', 'library-tabs');
    expect(driver.isSelected('two', 'library-tabs')).toBe(true);
    expect(driver.isPanelVisible('two', 'library-tabs')).toBe(true);
  });

  it('does not select disabled tabs and supports variants', () => {
    driver.render({ disabledTab: 'two', variant: 'pills' });
    driver.clickTab('two');
    expect(driver.isSelected('one')).toBe(true);
    expect(driver.getListClassName()).toContain('rounded-xl');
  });

  it('calls the tab-change callback', () => {
    const onTabChange = jest.fn();
    driver.render({ onTabChange });
    driver.clickTab('two');
    expect(onTabChange).toHaveBeenCalledWith('two');
  });
});