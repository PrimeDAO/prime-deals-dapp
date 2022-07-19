import { IClause } from "entities/DealRegistrationTokenSwap";
import { ViewMode } from "../../../../../resources/elements/editingCard/editingCard";
import { bindable, BindingMode, inject } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";
import { newInstanceForScope } from "@aurelia/kernel";
import { IValidationRules } from "@aurelia/validation";
import {
  PrimeErrorPresenter,
} from "../../../../../resources/elements/primeDesignSystem/validation/primeErrorPresenter";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./custom.css";

@inject()
export class TermClause {
  @bindable clause: IClause;
  @bindable index: number;
  @bindable({mode: BindingMode.fromView}) form: IValidationController;
  @bindable({mode: BindingMode.twoWay}) viewMode: ViewMode = "edit";
  @bindable hideDeleteButton: boolean;
  @bindable onDelete: () => boolean | undefined;
  @bindable onSaved?: () => void;
  private editor = null;
  domParser = null;
  constructor(
  @newInstanceForScope(IValidationController) form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,
    private presenter: PrimeErrorPresenter,
  ) {
    this.form = form;
    this.form.addSubscriber(presenter);
  }

  attached(){
    ClassicEditor
      .create( document.querySelector( "#editor"), {
        toolbar: {
          items: [ "bold", "italic", "underline", "link", "bulletedList", "numberedList" ],
        },
      } )
      .then( editor => {
        this.editor = editor;
        editor.model.document.on( "change:data", () => {
          const data = this.editor.getData();
          this.clause = {id: "", text: data};
        } );

      } )
      .catch( error => {
        console.error( "There was a problem initializing the editor.", error );
      } );
  }

  attaching() {
    this.validationRules
      .on(this.clause)
      .ensure("text")
      .required()
      .withMessage("Clause requires a description")
      .minLength(10)
      .withMessage("Clause must be at least 10 characters");
  }

  onSave() {
    return this.form.validate().then(result => result.valid);
  }

  delete() {
    if (this.onDelete()) {
      return;
    }
    this.form.removeObject(this.clause);
  }

  viewModeChanged(newValue: ViewMode) {
    if (newValue === "view") {
      this.onSaved?.();
    }
  }
}
