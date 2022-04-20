import axios from "axios";
import { bindable } from "aurelia-framework";
import "./markdown.scss";

const marked = require("marked");

export class Markdown{

  @bindable document: string;
  @bindable url: string;
  markdown = "";

  // constructor() {
  //   marked.setOptions({ breaks: true, gfm: true });
  // }

  attached(): void {
    if (this.url) {
      axios.get(this.url)
        .then((response) => {
          if (response.data && response.data.length) {
            this.markdown = marked(response.data);
          }
        });
    } else {
      this.markdown = marked(this.document);
    }
  }
}
