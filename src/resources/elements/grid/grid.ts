import { bindable, computedFrom, autoinject, View } from "aurelia-framework";
import { InlineViewStrategy } from "aurelia-templating";
import "./grid.scss";
import { SortOrder, SortService } from "services/SortService";

@autoinject
export class Grid {
  @bindable public rows: [] = [];
  @bindable public columns: { field: string, width: string }[] = [];
  @bindable public selectable = false;
  sortColumn: string;
  sortDirection: SortOrder;
  sortEvaluator: (a: any, b: any) => number;
  parent: View;

  constructor() {
    // you can inject the element or any DI in the constructor
  }

  created(owningView: View) {
    this.parent = owningView;
  }

  getBuffedVm(row:any){
    return {...this.parent.bindingContext, ...row, row: row};
  }

  sort(columnName: string) {
    if (this.sortColumn === columnName) {
      this.sortDirection = SortService.toggleSortOrder(this.sortDirection);
    } else {
      this.sortColumn = columnName;
    }
    this.sortEvaluator = (a, b) => SortService.evaluateString(a[columnName], b[columnName], this.sortDirection);
  }

  viewStrategy(html: string) {
    return new InlineViewStrategy(!html.startsWith("<template>") ? `<template>${html}</template>` : html, [this.parent]);
  }

  @computedFrom("columns")
  get gridTemplateColumnText() {
    return this.columns.map(y => y.width).join(" ");
  }

}
