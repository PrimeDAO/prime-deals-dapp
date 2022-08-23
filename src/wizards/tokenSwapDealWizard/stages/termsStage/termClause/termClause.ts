import { IClause } from "entities/DealRegistrationTokenSwap";
import { ViewMode } from "../../../../../resources/elements/editingCard/editingCard";
import { bindable, BindingMode, inject, observable } from "aurelia";
import { IValidationController } from "@aurelia/validation-html";
import { newInstanceForScope } from "@aurelia/kernel";
import { IValidationRules } from "@aurelia/validation";
import {
  PrimeErrorPresenter,
} from "../../../../../resources/elements/primeDesignSystem/validation/primeErrorPresenter";
import Editor from "ckeditor5-custom-build/build/ckeditor";
import "./custom.css";
import { marked } from "marked";

@inject()
export class TermClause {
  @bindable clause: IClause;
  @bindable index: number;
  @bindable({mode: BindingMode.twoWay}) viewMode: ViewMode = "edit";
  @bindable hideDeleteButton: boolean;
  @bindable onDelete: () => boolean | undefined;
  @bindable onSaved?: (clause: IClause) => void;
  private editor = null;
  charValue = null;
  @observable textareaRef: HTMLTextAreaElement = null;

  textareaRefChanged(newValue) {
    if (!this.editor && newValue) {
      this.editorInit(this.textareaRef);
    }
  }

  constructor(
    @newInstanceForScope(IValidationController) public form: IValidationController,
    @IValidationRules private validationRules: IValidationRules,
    private presenter: PrimeErrorPresenter,
  ) {
    this.form.addSubscriber(presenter);
  }

  async onSave() {
    const isValid = await this.form.validate().then(result => result.valid);
    if (isValid) {
      this.onSaved?.(this.clause);
    }
    return isValid;
  }

  editorInit(targetElement: HTMLTextAreaElement) {
    Editor
      .create(targetElement, {
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: "https://",
        },
        toolbar: {
          items: ["bold", "italic", "underline", "link", "bulletedList", "numberedList"],
        },
      })
      .then(editor => {
        this.editor = editor;
        let tempContent = null;
        editor.plugins.get("WordCount").on("update", (evt, stats) => {
          console.log("targetElement", targetElement);
          this.charValue = stats.characters;
          const isOverLimit = stats.characters > 500;
          if (isOverLimit) {
            if (tempContent){
              return;
            }
            tempContent = this.editor.getData();
            // s.substr(s.length - 5, 5).trim()
            editor.setData(tempContent);
            this.editor.model.change( writer => {
              writer.setSelection( writer.createPositionAt( editor.model.document.getRoot(), "end" ) );
              return;
            } );
          }
          else {
            const data = this.editor.getData();
            this.clause = {...this.clause, text: data};
            if (tempContent) {
              tempContent = null;
            }
          }
        });

        // editor.model.document.on("change:data", () => {
        //   if (tempContent) {
        //     this.editor.setData(tempContent);
        //   } else {
        //     const data = this.editor.getData();
        //     this.clause = {...this.clause, text: data};
        //   }
        // });

        editor.editing.view.document.on("clipboardInput", (evt, data) => {
          const dataTransfer = data.dataTransfer;
          const textContent = dataTransfer.getData("text/plain");

          if (!textContent) {
            return;
          }
          const viewContent = marked(textContent);
          data.content = editor.data.processor.toView(viewContent);
        });

        if (this.shouldSetText()) {
          this.editor.setData(this.clause.text);
        }

        this.validationRules
          .on(this.clause)
          .ensure("title")
          .required()
          .withMessage("Clause requires a title")
          .ensure("text")
          .required()
          .withMessage("Clause requires a description")
          .minLength(10)
          .withMessage("Clause must be at least 10 characters");
      })
      .catch(error => {
        console.error("There was a problem initializing the editor.", error);
      });
  }

  shouldSetText() {
    return !this.editor.getData() && this.clause.text;
  }

  delete() {
    if (this.onDelete()) {
      return;
    }
    this.form.removeObject(this.clause);
  }

  viewModeChanged(newValue: ViewMode) {
    if (newValue === "view") {
      this.onSaved?.(this.clause);
    }
  }
}
