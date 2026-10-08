import { HeadingDriver } from "./Heading.driver";

describe("Heading", () => {
  let driver: HeadingDriver;

  beforeEach(() => {
    driver = new HeadingDriver();
  });

  it.each([1, 2, 3, 4, 5, 6] as const)("renders semantic level %s", (level) => {
    driver.render({ level });

    expect(driver.getTagName()).toBe(`H${level}`);
  });

  it.each([
    ["5xl", "text-5xl", "tracking-tight"],
    ["4xl", "text-4xl", "tracking-tight"],
    ["3xl", "text-3xl", "leading-snug"],
    ["2xl", "text-2xl", "leading-snug"],
    ["xl", "text-xl", "leading-normal"],
    ["lg", "text-lg", "leading-normal"],
    ["md", "text-base", "leading-normal"],
    ["sm", "text-sm", "leading-normal"],
    ["xs", "text-xs", "uppercase"],
  ] as const)("applies %s size styles", (size, expectedClass, secondaryClass) => {
    driver.render({ size });

    expect(driver.getClassName()).toContain(expectedClass);
    expect(driver.getClassName()).toContain(secondaryClass);
  });

  it("supports a custom hook, id, content, alignment, color, and truncation", () => {
    driver.render({
      dataHook: "page-heading",
      id: "page-title",
      children: "Library",
      color: "primary",
      align: "center",
      truncate: true,
    });

    expect(driver.exists("page-heading")).toBe(true);
    expect(driver.getText("page-heading")).toBe("Library");
    expect(driver.getId("page-heading")).toBe("page-title");
    expect(driver.getClassName("page-heading")).toContain("text-emerald-600");
    expect(driver.getClassName("page-heading")).toContain("text-center");
    expect(driver.getClassName("page-heading")).toContain("truncate");
  });

  it.each([
    ["normal", "font-normal"],
    ["medium", "font-medium"],
    ["semibold", "font-semibold"],
    ["bold", "font-bold"],
    ["extrabold", "font-extrabold"],
  ] as const)("applies %s font weight", (weight, expectedClass) => {
    driver.render({ weight });

    expect(driver.getClassName()).toContain(expectedClass);
  });
});
