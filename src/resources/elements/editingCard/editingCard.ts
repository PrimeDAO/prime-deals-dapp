import { bindable, BindingMode } from "aurelia";
import { toBoolean } from "resources/binding-behaviours";

export type ViewMode = "edit" | "view";

export class EditingCard {
  @bindable onDelete: () => boolean | Promise<boolean>;
  @bindable onEdit: () => boolean | Promise<boolean>;
  @bindable onSave: () => boolean | Promise<boolean>;
  @bindable({mode: BindingMode.twoWay}) viewMode: ViewMode = "edit";
  @bindable({set: toBoolean, type: Boolean}) hideDeleteButton = false;

  private deleteButtonRef: HTMLElement;
  private saving: boolean;

  async attached() {
    this.viewMode = this.viewMode ?? "edit";
  }

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

      this.saving = false;
      if (!canSave) return;
    }

    this.viewMode = "view";
    this.saving = false;
  }

  async delete() {
    if (typeof this.onDelete === "function") {
      this.deleteButtonRef.querySelector("button").blur();

      const canDelete = await this.onDelete();
      if (!canDelete) return;
    }
  }
}
