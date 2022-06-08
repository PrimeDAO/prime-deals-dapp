import { SortOrder, SortService } from "services/SortService";
import { Utils } from "services/utils";
import { bindable, customElement, ICustomElementViewModel } from "aurelia";
import { ICustomAttributeViewModel, ICustomElementController, IHydratedController } from "@aurelia/runtime-html";

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

@customElement("pgrid")
export class PGrid implements ICustomElementViewModel {
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
  context: ICustomElementViewModel | ICustomAttributeViewModel;
  private seeingMore = false;

  binding(top: ICustomElementController<this>, direct: ICustomElementController<this>) {
    this.context = direct.viewModel ?? top.viewModel;
  }

  getBuffedVm(row: any) {
    const vm = { ...this.context, ...row, row: row };
    Object.keys(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this.context)))
      .filter(
        (y) => y !== "constructor" && y !== "bind" && y !== "__metadata__" && y !== "activate",
      )
      .forEach((y) => {
        vm[y] = this.context[y];
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
