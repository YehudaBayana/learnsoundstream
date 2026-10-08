import { PlaylistCardDriver } from "./PlaylistCard.driver";

describe("PlaylistCard", () => {
  it("renders under a configurable hook and selects its playlist", () => {
    const onClick = jest.fn();
    const driver = new PlaylistCardDriver();
    driver.render({ dataHook: "focus-mix-card", onClick });
    expect(driver.exists("focus-mix-card")).toBe(true);
    driver.click("focus-mix-card");
    expect(onClick).toHaveBeenCalledWith(driver.getPlaylist());
  });
});
