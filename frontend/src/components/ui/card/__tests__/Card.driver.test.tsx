import { CardDriver } from "./Card.driver";

describe("Card", () => {
  let driver: CardDriver;

  beforeEach(() => {
    driver = new CardDriver();
  });

  it("renders its root and compound sections with data hooks", () => {
    driver.render({ includeHeader: true, includeFooter: true });

    expect(driver.exists()).toBe(true);
    expect(driver.getPartText("header")).toBe("Header");
    expect(driver.getPartText("body")).toBe("Body");
    expect(driver.getPartText("footer")).toBe("Footer");
  });

  it("supports a custom data hook and semantic element", () => {
    driver.render({ dataHook: "track-card", as: "article" });

    expect(driver.exists("track-card")).toBe(true);
    expect(driver.getTagName("track-card")).toBe("ARTICLE");
  });

  it.each([
    ["default", "shadow-sm"],
    ["elevated", "shadow-lg"],
    ["outlined", "border-2"],
    ["ghost", "shadow-none"],
  ] as const)("applies %s variant styling", (variant, expectedClass) => {
    driver.render({ variant });

    expect(driver.getClassName()).toContain(expectedClass);
  });

  it("applies hover and clickable styles and handles clicks", () => {
    const onClick = jest.fn();
    driver.render({ hoverable: true, clickable: true, onClick });

    expect(driver.getTagName()).toBe("BUTTON");
    expect(driver.getClassName()).toContain("hover:shadow-md");
    expect(driver.getClassName()).toContain("focus:ring-2");
    driver.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
