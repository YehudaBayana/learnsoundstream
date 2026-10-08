import { AudioPlayerVolumeDriver } from "./AudioPlayerVolume.driver";

describe("AudioPlayerVolume", () => {
  it("disables mute without a track and renders the slider", () => {
    const driver = new AudioPlayerVolumeDriver();
    driver.render({ dataHook: "volume-control" });
    expect(driver.isMuteDisabled("volume-control")).toBe(true);
    expect(driver.hasVolumeSlider("volume-control")).toBe(true);
  });

  it("calls the mute toggle when a track is available", () => {
    const onToggleMute = jest.fn();
    const driver = new AudioPlayerVolumeDriver();
    driver.render({ hasTrack: true, onToggleMute });
    driver.clickMute();
    expect(onToggleMute).toHaveBeenCalledTimes(1);
  });
});
