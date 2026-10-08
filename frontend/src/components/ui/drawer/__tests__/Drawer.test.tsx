import { DrawerDriver } from "./Drawer.driver";

describe("Drawer Component", () => {
  let driver: DrawerDriver;

  beforeEach(() => {
    driver = new DrawerDriver();
  });

  afterEach(() => {
    driver.cleanUp();
  });

  describe("visibility and rendering", () => {
    it("does not render in document when isOpen is false", () => {
      driver.render({
        isOpen: false,
        onClose: jest.fn(),
      });
      expect(driver.isOpen()).toBe(false);
    });

    it("renders portal in document when isOpen is true", () => {
      driver.render({
        isOpen: true,
        onClose: jest.fn(),
      });
      expect(driver.isOpen()).toBe(true);
      expect(driver.getText()).toContain("Navigation Drawer");
      expect(driver.getText()).toContain("Drawer Body Content");
    });

    it("renders with custom data-hook identifier", () => {
      const customHook = "main-navigation-drawer";
      driver.render({
        isOpen: true,
        onClose: jest.fn(),
        dataHook: customHook,
      });
      expect(driver.isOpen(customHook)).toBe(true);
    });
  });
});
