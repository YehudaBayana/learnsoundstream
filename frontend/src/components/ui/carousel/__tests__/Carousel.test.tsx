import React from "react";
import { CarouselDriver } from "./Carousel.driver";

describe("Carousel Component", () => {
  let driver: CarouselDriver;

  beforeEach(() => {
    driver = new CarouselDriver();
  });

  describe("rendering", () => {
    it("renders carousel and navigation buttons properly", () => {
      driver.render({
        children: (
          <>
            <div data-hook="slide-1">Slide 1</div>
            <div data-hook="slide-2">Slide 2</div>
          </>
        ),
      });

      expect(driver.exists()).toBe(true);
      expect(driver.hasPrevButton()).toBe(true);
      expect(driver.hasNextButton()).toBe(true);
    });

    it("renders with custom data-hook identifier", () => {
      const customHook = "featured-tracks-carousel";
      driver.render({ dataHook: customHook });

      expect(driver.exists(customHook)).toBe(true);
      expect(driver.hasNextButton(customHook)).toBe(true);
      expect(driver.hasPrevButton(customHook)).toBe(true);
    });
  });

  describe("navigation and interaction", () => {
    it("handles next button click without throwing", () => {
      driver.render();
      const container = driver.getScrollContainer();
      container.scrollBy = jest.fn();

      expect(() => driver.clickNext()).not.toThrow();
      expect(container.scrollBy).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "smooth" }),
      );
    });

    it("handles prev button click without throwing", () => {
      driver.render();
      const container = driver.getScrollContainer();
      container.scrollBy = jest.fn();

      expect(() => driver.clickPrev()).not.toThrow();
      expect(container.scrollBy).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "smooth" }),
      );
    });
  });
});
