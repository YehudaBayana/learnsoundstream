import { ConfirmationModalDriver } from "./ConfirmationModal.driver";

describe("ConfirmationModal", () => {
  let driver: ConfirmationModalDriver;

  beforeEach(() => {
    driver = new ConfirmationModalDriver();
  });

  it("renders configurable root hook and modal content", () => {
    driver.render({ dataHook: "delete-confirmation", title: "Delete track" });

    expect(driver.isOpen("delete-confirmation")).toBe(true);
    expect(driver.getText("delete-confirmation")).toContain("Delete track");
    expect(driver.getText("delete-confirmation")).toContain("Proceed with this action?");
  });

  it("does not render its root while closed", () => {
    driver.render({ isOpen: false });

    expect(driver.isOpen()).toBe(false);
  });

  it("calls the corresponding handlers for cancel and confirm actions", () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    driver.render({ onClose, onConfirm });

    driver.clickCancel();
    driver.clickConfirm();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("uses custom action labels", () => {
    driver.render({ confirmLabel: "Remove", cancelLabel: "Keep" });

    expect(driver.getText()).toContain("Remove");
    expect(driver.getText()).toContain("Keep");
  });

  it("disables action buttons while loading", () => {
    driver.render({ isLoading: true });

    expect(driver.isConfirmDisabled()).toBe(true);
  });
});
