import { ToastContainerDriver } from "./ToastContainer.driver";
import { useToastStore } from "@/store/useToastStore";

describe("ToastContainer", () => {
  let driver: ToastContainerDriver;

  beforeEach(() => {
    jest.useFakeTimers();
    useToastStore.setState({ toasts: [] });
    driver = new ToastContainerDriver();
  });

  afterEach(() => jest.useRealTimers());

  it("renders nothing when the store has no active toasts", () => {
    driver.render();
    expect(driver.exists()).toBe(false);
  });

  it("renders and dismisses active toasts", () => {
    useToastStore.setState({
      toasts: [{ id: "toast-42", message: "Added to queue", variant: "success" }],
    });
    driver.render("global-notifications");
    expect(driver.exists("global-notifications")).toBe(true);
    expect(driver.hasToast("toast-42", "global-notifications")).toBe(true);
    driver.clickDismiss("toast-42", "global-notifications");
    driver.advanceDismissAnimation();
    expect(driver.hasToast("toast-42", "global-notifications")).toBe(false);
  });
});
