export class EditingCardPlayground {
  private viewContent = "View";
  private editContent = "Edit";

  onEdit() {
    this.editContent = "Edit (changed)";
    return true;
  }

  onSave() {
    this.viewContent = "View (changed)";
    return true;
  }

  onDelete() {
    this.editContent = "(deleted)";
    return true;
  }
}
