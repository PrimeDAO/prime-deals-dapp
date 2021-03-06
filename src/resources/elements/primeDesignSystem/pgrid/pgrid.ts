import { customElement, bindable, computedFrom, autoinject, View } from "aurelia-framework";
import { InlineViewStrategy } from "aurelia-templating";
import "./pgrid.scss";
import { SortOrder, SortService } from "services/SortService";
import { Utils } from "services/utils";

export interface IGridColumn {
  field: string;
  headerText?: string;
  sortable?: boolean;
  width: string;
  headerClass?: string;
  align?: string;
  template?: string;
  sortFunc?: (a: unknown, b: unknown, sortDirection?: SortOrder) => number;
}

@autoinject
@customElement("pgrid")
export class PGrid {
  @bindable id?: string;
  @bindable condensed = false;
  @bindable public rows: [] = [];
  @bindable public columns: IGridColumn[] = [];
  @bindable public selectable = false;
  @bindable public sortColumn: string;
  @bindable public sortDirection: SortOrder;
  @bindable public numberToShow = 10;
  @bindable public hideMore = true;
  sortEvaluator: (a: any, b: any) => number;
  parent: View;
  private seeingMore = false;

  created(owningView: View) {
    this.parent = owningView;
  }

  getBuffedVm(row: any) {
    const context = this.parent.bindingContext;
    const vm = { ...context, ...row, row: row };
    Object.keys(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(context)))
      .filter(
        (y) => y !== "constructor" && y !== "bind" && y !== "__metadata__" && y !== "activate",
      )
      .forEach((y) => {
        vm[y] = context[y];
      });
    return vm;
  }

  bind() {
    if (this.sortColumn) {
      this.sort(this.sortColumn, false);
    }
  }

  sort(columnName: string, changeSortDirection = true) {
    if (changeSortDirection) {
      if (this.sortColumn === columnName) {
        this.sortDirection = SortService.toggleSortOrder(this.sortDirection);
      } else {
        this.sortColumn = columnName;
        this.sortDirection = SortOrder.ASC;
      }
    }

    const currentColumn = this.columns.find((y) => y.field === columnName);
    if (currentColumn?.sortFunc) {
      this.sortEvaluator = (a, b) => currentColumn.sortFunc(a, b, this.sortDirection);
      return;
    }

    this.sortEvaluator = (a, b) =>
      !isNaN(Utils.getPropertyFromString(a, columnName))
        ? SortService.evaluateNumber(
          Utils.getPropertyFromString(a, columnName),
          Utils.getPropertyFromString(b, columnName),
          this.sortDirection,
        )
        : Utils.getPropertyFromString(a, columnName) instanceof Date
          ? SortService.evaluateDateTimeAsDate(
            Utils.getPropertyFromString(a, columnName),
            Utils.getPropertyFromString(b, columnName),
            this.sortDirection,
          )
          : SortService.evaluateString(
            Utils.getPropertyFromString(a, columnName),
            Utils.getPropertyFromString(b, columnName),
            this.sortDirection,
          );
  }

  viewStrategy(html: string) {
    return new InlineViewStrategy(
      !html.startsWith("<template>") ? `<template>${html}</template>` : html,
    );
  }

  @computedFrom("columns")
  get gridTemplateColumnText() {
    return this.columns?.map((y) => y.width).join(" ");
  }

  /**
   * This allows for more rows to be displayed on the grid
   * @param yesNo
   */
  public seeMore(yesNo: boolean): void {
    this.seeingMore = yesNo;
  }

}
