import { BadgeDriver } from "./Badge.driver";

describe("Badge Component", () => {
  let driver: BadgeDriver;

  beforeEach(() => {
    driver = new BadgeDriver();
  });

  describe("rendering", () => {
    it("renders badge text properly", () => {
      driver.render({ children: "New Feature" });
      expect(driver.exists()).toBe(true);
      expect(driver.getText()).toBe("New Feature");
    });

    it("renders with custom data-hook", () => {
      driver.render({ children: "Status", dataHook: "status-badge" });
      expect(driver.exists("status-badge")).toBe(true);
      expect(driver.getText("status-badge")).toBe("Status");
    });
  });

  describe("styling and variants", () => {
    it("applies default variant styles", () => {
      driver.render({ variant: "default" });
      expect(driver.getClasses()).toContain("bg-gray-100");
    });

    it("applies primary variant styles", () => {
      driver.render({ variant: "primary" });
      expect(driver.getClasses()).toContain("bg-emerald-100");
    });

    it("renders pill shape when pill prop is true", () => {
      driver.render({ pill: true });
      expect(driver.isPill()).toBe(true);
    });

    it("renders outlined style when outlined prop is true", () => {
      driver.render({ outlined: true, variant: "primary" });
      expect(driver.isOutlined()).toBe(true);
    });
  });

  describe("removable badge interactions", () => {
    it("renders remove button when removable and onRemove are provided", () => {
      const handleRemove = jest.fn();
      driver.render({ children: "Filter Tag", removable: true, onRemove: handleRemove });
      expect(driver.hasRemoveButton()).toBe(true);
    });

    it("calls onRemove when remove button is clicked", () => {
      const handleRemove = jest.fn();
      driver.render({ children: "Filter Tag", removable: true, onRemove: handleRemove });

      driver.clickRemove();
      expect(handleRemove).toHaveBeenCalledTimes(1);
    });
  });
});
