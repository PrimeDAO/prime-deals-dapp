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

  attaching(){
    console.log("validationState", this.validationState);
    console.log("this.value", this.value);
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
              const trimmedString = this.editor.getData().slice(0, 500);
              editor.setData(trimmedString);
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
            data.content = editor.data.processor.toView(viewContent);
          });
        });
    }

  }
}
