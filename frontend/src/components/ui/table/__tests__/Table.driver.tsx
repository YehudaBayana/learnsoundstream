import React from "react";
import { fireEvent, render, RenderResult } from "@testing-library/react";
import Table from "../Table";
import { getByDataHook } from "@/__tests__/testUtils";

export interface TableDriverProps {
  dataHook?: string;
  striped?: boolean;
  selectedRow?: boolean;
  onSort?: () => void;
}

export class TableDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = "test-table";

  render(props: TableDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(
      <Table dataHook={dataHook} striped={props.striped}>
        <Table.Head dataHook={`${dataHook}-head`}>
          <Table.Row dataHook={`${dataHook}-header-row`}>
            <Table.Th dataHook={`${dataHook}-header-cell`} sortable onSort={props.onSort}>
              Title
            </Table.Th>
          </Table.Row>
        </Table.Head>
        <Table.Body dataHook={`${dataHook}-body`}>
          <Table.Row dataHook={`${dataHook}-selected-row`} selected={props.selectedRow}>
            <Table.Td dataHook={`${dataHook}-cell`}>Track</Table.Td>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    return this;
  }

  private getElement(suffix: string, dataHook = this.defaultDataHook): HTMLElement {
    if (!this.renderResult) throw new Error("TableDriver: render() must be called before querying");
    return getByDataHook(this.renderResult.container, `${dataHook}${suffix}`);
  }

  hasRoot(dataHook = this.defaultDataHook): boolean {
    return this.getElement("", dataHook) !== null;
  }

  getTableClassName(dataHook = this.defaultDataHook): string {
    return this.getElement("-table", dataHook).className;
  }

  getSelectedRowClassName(dataHook = this.defaultDataHook): string {
    return this.getElement("-selected-row", dataHook).className;
  }

  clickSortableHeader(dataHook = this.defaultDataHook): void {
    fireEvent.click(this.getElement("-header-cell", dataHook));
  }
}
