import { SmartImageDriver } from "./SmartImage.driver";

describe("SmartImage", () => {
  let driver: SmartImageDriver;

  beforeEach(() => {
    driver = new SmartImageDriver();
  });

  it("renders fallback content under a configurable root hook", () => {
    driver.render({ dataHook: "playlist-cover", entityType: "playlist" });
    expect(driver.exists("playlist-cover")).toBe(true);
    expect(driver.getClassName("playlist-cover")).toContain("aspect-square");
  });

  it("renders the image component when a source is available", () => {
    driver.render({ dataHook: "track-cover", src: "/cover.jpg", aspectRatio: "16/9" });
    expect(driver.hasImageWrapper("track-cover")).toBe(true);
    expect(driver.getClassName("track-cover")).toContain("aspect-video");
  });
});
