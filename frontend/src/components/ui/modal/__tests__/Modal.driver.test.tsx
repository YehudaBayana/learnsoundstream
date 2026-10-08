import { ModalDriver } from './Modal.driver';

describe('Modal', () => {
  let driver: ModalDriver;
  let originalOverflow: string;

  beforeEach(() => {
    originalOverflow = document.body.style.overflow;
    driver = new ModalDriver();
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  it('renders its sections under a configurable hook', () => {
    driver.render({ dataHook: 'playlist-modal' });
    expect(driver.isOpen('playlist-modal')).toBe(true);
    expect(driver.hasSection('header', 'playlist-modal')).toBe(true);
    expect(driver.hasSection('body', 'playlist-modal')).toBe(true);
    expect(driver.hasSection('footer', 'playlist-modal')).toBe(true);
  });

  it('hides when closed and restores body scrolling', () => {
    driver.render();
    expect(document.body.style.overflow).toBe('hidden');
    driver.setOpen(false);
    expect(driver.isOpen()).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('closes from the header button, escape key, and backdrop', () => {
    const onClose = jest.fn();
    driver.render({ onClose });
    driver.clickCloseButton();
    driver.pressEscape();
    driver.clickBackdrop();
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('respects disabled close actions and applies modal sizing', () => {
    driver.render({ closeOnBackdrop: false, closeOnEscape: false, size: 'lg' });
    driver.clickBackdrop();
    driver.pressEscape();
    expect(driver.getPanelClassName()).toContain('max-w-lg');
  });
});