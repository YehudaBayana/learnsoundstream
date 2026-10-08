import { ImageDriver } from "./Image.driver";

describe("Image", () => {
  let driver: ImageDriver;

  beforeEach(() => {
    driver = new ImageDriver();
  });

  it("renders an image under a configurable root hook", () => {
    driver.render({ dataHook: "album-cover" });

    expect(driver.hasRoot("album-cover")).toBe(true);
    expect(driver.hasImage("album-cover")).toBe(true);
  });

  it("applies fit and rounded styles", () => {
    driver.render({ fit: "contain", rounded: "lg" });

    expect(driver.getImageClassName()).toContain("object-contain");
    expect(driver.getRootClassName()).toContain("rounded-lg");
  });

  it("removes the loading skeleton after the image loads", async () => {
    driver.render({ showSkeleton: true });
    expect(driver.hasSkeleton()).toBe(true);

    await driver.loadImage();

    expect(driver.hasSkeleton()).toBe(false);
  });
});
