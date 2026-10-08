import { FileInputDriver } from "./FileInput.driver";

describe("FileInput", () => {
  let driver: FileInputDriver;

  beforeEach(() => {
    driver = new FileInputDriver();
  });

  it("renders a custom hook and forwards button clicks to the file input", () => {
    driver.render({ dataHook: "audio-upload", buttonText: "Choose audio" });
    const inputClick = driver.spyOnInputClick("audio-upload");

    expect(driver.exists("audio-upload")).toBe(true);
    driver.clickButton("audio-upload");
    expect(inputClick).toHaveBeenCalledTimes(1);
  });

  it("reports selected filenames and invokes file change callbacks", () => {
    const onFilesChange = jest.fn();
    driver.render({ onFilesChange });
    driver.selectFile();

    expect(driver.getSelectedFiles()).toBe("track.wav");
    expect(onFilesChange).toHaveBeenCalledTimes(1);
  });

  it("supports disabled and error states", () => {
    driver.render({ disabled: true, error: true });

    expect(driver.isDisabled()).toBe(true);
    expect(driver.getButtonClassName()).toContain("ring-rose-500");
  });
});
