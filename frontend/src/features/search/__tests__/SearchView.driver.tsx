import { fireEvent, render, RenderResult } from "@testing-library/react";
import SearchView from "../views/SearchView";
import { getByDataHook, queryByDataHook } from "@/__tests__/testUtils";

export interface SearchViewDriverProps {
  dataHook?: string;
}

export class SearchViewDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "search-view";
  private currentDataHook = this.defaultDataHook;

  render(props: SearchViewDriverProps = {}): this {
    this.currentDataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<SearchView dataHook={this.currentDataHook} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult)
      throw new Error("SearchViewDriver: render() must be called before querying");
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  changeSearchTerm(term: string, dataHook = this.currentDataHook): void {
    fireEvent.change(getByDataHook(this.getContainer(), `${dataHook}-input`), {
      target: { value: term },
    });
  }

  submitSearch(dataHook = this.currentDataHook): void {
    fireEvent.keyDown(getByDataHook(this.getContainer(), `${dataHook}-input`), {
      key: "Enter",
      code: "Enter",
    });
  }

  hasResult(trackId: string): boolean {
    return queryByDataHook(this.getContainer(), `search-result-${trackId}`) !== null;
  }
}
