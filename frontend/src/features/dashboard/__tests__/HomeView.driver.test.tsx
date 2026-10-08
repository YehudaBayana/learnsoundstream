import { HomeViewDriver } from './HomeView.driver';

jest.mock('../components/ServerStatus', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('../components/Footer', () => ({ __esModule: true, default: () => <footer /> }));

describe('HomeView', () => {
  it('renders the dashboard root with a configurable data hook', () => {
    const driver = new HomeViewDriver();
    driver.render('dashboard-home');
    expect(driver.exists('dashboard-home')).toBe(true);
  });
});