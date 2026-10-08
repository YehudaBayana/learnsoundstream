import { DashboardShellDriver } from './DashboardShell.driver';
import * as themeModule from '@/shared/context/ThemeContext';

jest.mock('next/navigation', () => ({ usePathname: () => '/' }));
jest.mock('@/shared/context/ThemeContext', () => ({ useTheme: jest.fn() }));
jest.mock('@/features/dashboard/components/Sidebar', () => ({ __esModule: true, default: () => <div /> }));

describe('DashboardShell', () => {
  let driver: DashboardShellDriver;
  const toggleTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (themeModule.useTheme as jest.Mock).mockReturnValue({
      themeDefinition: { label: 'Night', icon: 'moon' },
      toggleTheme,
    });
    driver = new DashboardShellDriver();
  });

  it('renders a configurable shell root and page content', () => {
    driver.render('app-shell');
    expect(driver.exists('app-shell')).toBe(true);
    expect(driver.hasPageContent('app-shell')).toBe(true);
  });

  it('delegates theme changes to the theme context', () => {
    driver.render();
    driver.clickThemeToggle();
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});