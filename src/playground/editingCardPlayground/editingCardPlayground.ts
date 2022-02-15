export class EditingCardPlayground {
  private viewContent = "View";
  private editContent = "Edit";

  onEdit() {
    this.editContent = "Edit (changed)";
  }

  onSave() {
    this.viewContent = "View (changed)";
  }

  onDelete() {
    this.editContent = "(deleted)";
  }
}
