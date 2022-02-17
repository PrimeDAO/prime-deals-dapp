import { bindable } from "aurelia-framework";
import "./editingCard.scss";

export class EditingCard {
  @bindable onDelete: () => boolean | Promise<boolean>;
  @bindable onEdit: () => boolean | Promise<boolean>;
  @bindable onSave: () => boolean | Promise<boolean>;

  private viewMode: "edit" | "view" = "edit";
  saving: boolean;

  async edit() {
    if (typeof this.onEdit === "function") {
      const canEdit = await this.onEdit();
      if (!canEdit) return;
    }

    this.viewMode = "edit";
  }

  async save() {
    this.saving = true;

    if (typeof this.onSave === "function") {
      const canSave = await this.onSave();
      if (!canSave) return;
    }

    this.viewMode = "view";
    this.saving = false;
  }

  async delete() {
    if (typeof this.onDelete === "function") {
      const canDelete = await this.onDelete();
      if (!canDelete) return;
    }
  }
}
