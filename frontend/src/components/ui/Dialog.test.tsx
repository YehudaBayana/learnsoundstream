import { DialogDriver } from './Dialog.driver';

describe('Dialog Component', () => {
  let driver: DialogDriver;

  beforeEach(() => {
    driver = new DialogDriver();
  });

  afterEach(() => {
    driver.cleanUp();
  });

  describe('visibility and content', () => {
    it('does not render dialog content when isOpen is false', () => {
      driver.render({
        isOpen: false,
        onClose: jest.fn(),
        title: 'Delete Playlist',
      });
      expect(driver.isOpen()).toBe(false);
    });

    it('renders title and description when isOpen is true', () => {
      driver.render({
        isOpen: true,
        onClose: jest.fn(),
        title: 'Delete Playlist',
        description: 'Are you sure you want to delete this playlist?',
      });
      expect(driver.isOpen()).toBe(true);
      expect(driver.getTitle()).toBe('Delete Playlist');
      expect(driver.getDescription()).toBe('Are you sure you want to delete this playlist?');
    });

    it('renders with custom data-hook identifier', () => {
      const customHook = 'delete-dialog';
      driver.render({
        isOpen: true,
        onClose: jest.fn(),
        title: 'Delete Confirmation',
        dataHook: customHook,
      });
      expect(driver.isOpen(customHook)).toBe(true);
      expect(driver.getTitle(customHook)).toBe('Delete Confirmation');
    });
  });

  describe('actions and events', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      const handleConfirm = jest.fn();
      driver.render({
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: handleConfirm,
        title: 'Confirm Action',
      });

      driver.clickConfirm();
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button is clicked', () => {
      const handleClose = jest.fn();
      driver.render({
        isOpen: true,
        onClose: handleClose,
        title: 'Cancel Action',
      });

      driver.clickCancel();
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when top close button is clicked', () => {
      const handleClose = jest.fn();
      driver.render({
        isOpen: true,
        onClose: handleClose,
        title: 'Close Modal',
      });

      driver.clickClose();
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('hides cancel button when hideCancel is true', () => {
      driver.render({
        isOpen: true,
        onClose: jest.fn(),
        title: 'Alert Only',
        hideCancel: true,
      });
      expect(driver.hasCancelButton()).toBe(false);
    });
  });
});
