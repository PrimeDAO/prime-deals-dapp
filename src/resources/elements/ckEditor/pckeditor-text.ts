import { ValidationState } from "../primeDesignSystem/types";
import { bindable, BindingMode, customElement } from "aurelia";
import { marked } from "marked";
import Editor from "ckeditor5-custom-build/build/ckeditor";
import "./custom.css";

@customElement("pckeditor-text")
export class PCkeditorText {
  private editorRef: HTMLDivElement;
  @bindable validationState?: ValidationState;
  @bindable({mode: BindingMode.twoWay}) value: string;
  @bindable({ mode: BindingMode.twoWay}) charValue = 0;
  private editor = null;
  private tempContent = null;
  private enableInput = null;

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

  attaching(){
    if (!this.editor && this.editorRef) {
      Editor
        .create(this.editorRef, {
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
            this.value = data;
          });

          editor.editing.view.document.on("clipboardInput", (evt, data) => {
            const dataTransfer = data.dataTransfer;
            const textContent = dataTransfer.getData("text/plain");

            if (!textContent) {
              return;
            }
            const viewContent = marked(textContent);
            if (textContent.length + editor.getData().length >= 500) {
              const limit = editor.getData().startsWith("<p>") && editor.getData().endsWith("</p>") ? 507 : 500;
              const index = limit - editor.getData().length < 0 ? 0 : limit - editor.getData().length;
              const str = textContent.slice(0, index);
              data.content = editor.data.processor.toView(str);
              return;
            }
            data.content = editor.data.processor.toView(viewContent);
          });
        });
    }

  }
}
