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
  private tempContent = null;
  private enableInput = null;
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

  disableCommand( cmd ) {
    cmd.on( "set:isEnabled", forceDisable, { priority: "highest" } );
    cmd.isEnabled = false;

    return () => {
      cmd.off( "set:isEnabled", forceDisable );
      cmd.isEnabled = true;
      cmd.refresh();
    };

    function forceDisable( evt ) {
      evt.return = false;
      evt.stop();
    }
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
        editor.plugins.get("WordCount").on("clipboardInput", (evt, stats) => {
          console.log("stats,ect", stats, evt);
        });
        editor.plugins.get("WordCount").on("update", (evt, stats) => {
          this.charValue = stats.characters;
          const isOverLimit = stats.characters > 500;
          if (isOverLimit) {
            this.enableInput = this.disableCommand( editor.commands.get( "input" ) );
            if (this.tempContent){
              return;
            }
            this.tempContent = this.editor.getData();
          }
          else {
            this.tempContent = null;
            if (this.enableInput) {
              this.enableInput();
              this.enableInput = null;
            }
          }
        });

        editor.model.document.on("change:data", () => {
          const data = this.editor.getData();
          this.clause = {...this.clause, text: data};
        });

        editor.editing.view.document.on("clipboardInput", (evt, data) => {
          const dataTransfer = data.dataTransfer;
          const textContent = dataTransfer.getData("text/plain");

          if (!textContent) {
            return;
          }
          const viewContent = marked(textContent);
          if (textContent.length + editor.getData().length >= 500) {
            // editor.commands.execute("selectAll");
            // editor.commands.execute("delete");
            const limit = editor.getData().startsWith("<p>") && editor.getData().endsWith("</p>") ? 507 : 500;
            const index = limit - editor.getData().length < 0 ? 0 : limit - editor.getData().length;
            const str = textContent.slice(0, index);
            data.content = editor.data.processor.toView(str);
            return;
          }
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
