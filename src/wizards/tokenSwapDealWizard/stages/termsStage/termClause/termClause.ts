import { IClause } from "entities/DealRegistrationTokenSwap";
import { ViewMode } from "../../../../../resources/elements/editingCard/editingCard";
import { bindable, BindingMode, inject } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";
import { newInstanceForScope } from "@aurelia/kernel";
import { IValidationRules } from "@aurelia/validation";
import {
  PrimeErrorPresenter,
} from "../../../../../resources/elements/primeDesignSystem/validation/primeErrorPresenter";
import { marked } from "marked";
import Editor from "ckeditor5-custom-build/build/ckeditor";
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
  charValue = null;

  constructor(
  @newInstanceForScope(IValidationController) form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,
    private presenter: PrimeErrorPresenter,
  ) {
    this.form = form;
    this.form.addSubscriber(presenter);
  }

  attached(){
    Editor
      .create( document.querySelector( "#editor"), {
        toolbar: {
          items: [ "bold", "italic", "underline", "link", "bulletedList", "numberedList" ],
        },
      } )
      .then( editor => {
        this.editor = editor;
        editor.plugins.get( "WordCount" ).on( "update", ( evt, stats ) => {
          this.charValue = stats.characters;
          const isOverLimit = stats.characters > 500;
          if (isOverLimit){
            const trimmedString = this.editor.getData().slice(0, 500);
            editor.setData(trimmedString);
          }
        } );

        editor.model.document.on( "change:data", () => {
          const data = this.editor.getData();
          this.clause = {...this.clause, text: marked(data)};
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
