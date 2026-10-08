import { MenuDriver } from "./Menu.driver";

describe("Menu", () => {
  let driver: MenuDriver;

  beforeEach(() => {
    driver = new MenuDriver();
  });

  it("opens from its trigger and closes after item selection", () => {
    const onItemClick = jest.fn();
    driver.render({ dataHook: "track-menu", onItemClick });
    driver.clickTrigger("track-menu");
    expect(driver.isOpen("track-menu")).toBe(true);
    driver.clickItem("track-menu");
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(driver.isOpen("track-menu")).toBe(false);
  });

  it("supports placement configuration", () => {
    driver.render({ placement: "top-start" });
    driver.clickTrigger();
    expect(driver.isOpen()).toBe(true);
  });
});
