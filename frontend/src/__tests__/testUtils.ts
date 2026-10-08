import { RenderResult } from "@testing-library/react";

/**
 * Helper to query an element by data-hook attribute within a container or document.
 */
export const queryByDataHook = (
  container: HTMLElement | Document | RenderResult["container"],
  dataHook: string,
): HTMLElement | null => {
  return container.querySelector(`[data-hook="${dataHook}"]`);
};

/**
 * Helper to get an element by data-hook attribute, throwing an error if not found.
 */
export const getByDataHook = (
  container: HTMLElement | Document | RenderResult["container"],
  dataHook: string,
): HTMLElement => {
  const element = queryByDataHook(container, dataHook);
  if (!element) {
    throw new Error(`Unable to find an element by [data-hook="${dataHook}"]`);
  }
  return element;
};

/**
 * Helper to query all elements matching data-hook attribute.
 */
export const queryAllByDataHook = (
  container: HTMLElement | Document | RenderResult["container"],
  dataHook: string,
): HTMLElement[] => {
  return Array.from(container.querySelectorAll(`[data-hook="${dataHook}"]`));
};
