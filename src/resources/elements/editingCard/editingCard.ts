import { bindable } from "aurelia-framework";
import "./editingCard.scss";

export class EditingCard {
  @bindable onDelete: () => void;
  @bindable onEdit: () => void;
  @bindable onSave: () => void;

  private viewMode: "edit" | "view" = "edit";

  edit() {
    this.viewMode = "edit";
    this.onEdit();
  }

  save() {
    this.viewMode = "view";
    this.onSave();
  }

  delete() {
    this.onDelete();
  }
}
